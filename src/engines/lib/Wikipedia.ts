import axios from "axios";
import { getOptions, Options } from "../../types/Wikipedia";
import * as cheerio from 'cheerio';
import HttpsProxyAgent from 'https-proxy-agent';
import _url from "../../utils/handleUrl";
import useProxies from "../../utils/useProxies";
import https from 'https';

export class Wikipedia {
    private options: Options = getOptions();
    private updateQueries: (name: string, value: any) => void;

    constructor(options: Options = getOptions()) {
        let _options = {
            ...getOptions(),
            ...options
        };

        function updateQueries(name: string, value: any) {
            _options.queries = {
                ..._options.queries,
                [name]: value
            }
        }

        this.updateQueries = updateQueries;
        this.options = _options;
    }

    useProxies = useProxies;
    public async get(query: string): Promise<{}> {
        const __proxy = this.options.proxy;
        if (__proxy) {
            this.options.proxies.push(__proxy);
            this.options.proxy = undefined;
        }

        return await this.useProxies(() => this._get(query));
    }

    private async _get(query: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const agent = this.options.proxy ? HttpsProxyAgent({
                host: this.options.proxy?.host,
                port: this.options.proxy?.port,
                auth: this.options.proxy?.auth ? this.options.proxy?.auth?.username + ':' + this.options.proxy?.auth?.password : undefined
            }) : new https.Agent({
                rejectUnauthorized: false
            });

            return await axios(Object.assign({
                url: _url(`https://${this.options.language}.wikipedia.org/wiki/${query.replace(/ /g, '_')}`, this.options.queries),
                method: 'GET',
                headers: this.options.headers,
            }, (agent ? {
                proxy: this.options.proxy ? {
                    host: this.options.proxy?.host,
                    port: this.options.proxy?.port,
                    auth: {
                        username: this.options.proxy?.auth?.username,
                        password: this.options.proxy?.auth?.password
                    }
                } : undefined,
                httpsAgent: agent
            } : {}))).then(response => {
                const html = response.data;
                const $ = cheerio.load(html);
                let result: {
                    title?: string,
                    image?: string,
                    description?: {
                        clean?: string,
                        links?: any[],
                        markdown?: string
                    }
                    infobox?: any[]
                } = {
                    title: undefined,
                    image: undefined,
                    description: {
                        clean: undefined,
                        links: undefined,
                        markdown: undefined
                    },
                    infobox: undefined
                };

                const fixText = (text: string) => text.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ').trim();
                const formatLink = (text: string) => {
                    let _ = text;
                    const regex = /\(([^)]+)\)/;
                    const match = regex.exec(_);
                    if (match) {
                        const m = match[1];
                        _ = _.replace(`_(${m})`, '');
                    }

                    _ = _.replace('/wiki/', '').replace(/_/g, '+').toLowerCase();
                    if (_.endsWith('.')) _ = _.slice(0, _.length - 1);

                    return `https://nustry.com/search?q=${_}`
                }

                $('.mw-parser-output').each((i, element) => {
                    const $element = $(element);
                    const $p = $element.find('p').not('.mw-empty-elt');
                    $p.find('sup').remove();
                    $p.first().each((i, element) => {
                        const $element = $(element);
                        const text = $element.text();
                        const links: any[] = [];
                        $element.find('a').each((i, element) => {
                            const $element = $(element);
                            const href = $element.attr('href');
                            if (href && href.startsWith('/wiki/')) {
                                links.push({
                                    href: href,
                                    text: $element.text()
                                })
                            }
                        });
                        
                        result.description.clean = fixText(text);
                        result.description.links = links;
                        result.description.markdown = links.reduce((prev, curr) => {
                            return prev.replace(curr.text, `[${curr.text}](${formatLink(curr.href)})`);
                        }, fixText(text));
                    });
                });

                $('.infobox').each((i, element) => {
                    const $element = $(element);
                    result.title = $element.find('caption').first().text();
                    result.image = $element.find('a.image img').first().attr('src');
                    const $tr = $element.find('tr');
                    let values: any[] = [];
                    $tr.each((i, element) => {
                        const $element = $(element);
                        const $th = $element.find('th');
                        const $td = $element.find('td');
                        $td.find('sup').remove();
                        const th = $th.text();
                        if (!th) return;
                        const isHaveLI = $td.find('li').length > 0;
                        const isHaveTable = $td.find('table').length > 0;
                        const isHaveBR = $td.find('br').length > 0;

                        let res: any = [fixText($td.text())];
                        if (isHaveLI) {
                            const $li = $td.find('li');
                            const li: string[] = [];
                            $li.each((i, element) => {
                                const $element = $(element);
                                li.push(fixText($element.text()));
                            });
                            res = li;
                        } else if (isHaveTable) {
                            const $table = $td.find('table');
                            const table: {
                                [key: string]: any
                            } = {};
                            $table.each((i, element) => {
                                const $element = $(element);
                                const $tr = $element.find('tr');
                                $tr.each((i, element) => {
                                    const $element = $(element);
                                    const $th = $element.find('th');
                                    const $td = $element.find('td');
                                    const th = fixText($th.text());
                                    if (!th) return;
                                    table[th] = fixText($td.text());
                                });
                            });
                            res = table;
                        } else if (isHaveBR) {
                            const removeTags = (text: string) => text.replace(/(<([^>]+)>)/gi, '');
                            res = $td.html().split('<br>').map((text: string) => {
                                return fixText(removeTags(text));
                            })
                        }

                        const response = res;
                        const $a = $td.find('a');
                        const href = $a.attr('href');
                        let links: any[] = [];
                        if (href) {
                            $a.map((i, element) => {
                                const $element = $(element);
                                links.push({
                                    href: $element.attr('href'),
                                    text: $element.text(),
                                    isFound: $element.attr('href').startsWith('/wiki/')
                                });
                            });
                        }

                        const _ = {
                            label: th,
                            response: {
                                clean: response,
                                markdown: links.reduce((prev, curr) => {
                                    return prev.replace(curr.text, `[${curr.text}](${formatLink(curr.href)})`);
                                }, fixText($td.text()))
                            },
                            links
                        };

                        values.push(_);
                    });

                    result['infobox'] = values
                });

                const data = {
                    result,
                    proxy: this.options.proxy,
                    queries: this.options.queries
                };

                return resolve(data);
            }).catch(error => {
                return reject(error);
            });
        });
    }
}