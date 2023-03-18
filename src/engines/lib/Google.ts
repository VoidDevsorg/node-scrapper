import axios from "axios";
import { getOptions, Options } from "../../types/Google";
import * as cheerio from 'cheerio';
import HttpsProxyAgent from 'https-proxy-agent';
import _url from "../../utils/handleUrl";
import useProxies from "../../utils/useProxies";
import https from 'https';

export class Google {
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

        if (_options?.mkt) {
            if (!_options?.queries?.lr) updateQueries('lr', 'lang_' + (_options?.mkt?.split('-')?.[0] || 'en'));
            if (!_options?.queries?.hl) updateQueries('hl', _options?.mkt?.split('-')?.[0] || 'en');
            if (!_options?.queries?.gl) updateQueries('gl', _options?.mkt?.split('-')?.[1] || 'US');
        }

        if (_options?.safe) {
            if (!_options?.queries?.safe) updateQueries('safe', _options?.safe);
        }

        if (_options?.perPage) {
            if (!_options?.queries?.num) updateQueries('num', _options?.perPage);
            if (!_options?.queries?.start) updateQueries('start', (_options?.page - 1) * _options?.perPage);
        }


        this.updateQueries = updateQueries;
        this.options = _options;
    }

    useProxies = useProxies;
    public async search(query: string): Promise<{}> {
        if (!this.options?.queries?.q) this.updateQueries('q', query);
        const __proxy = this.options.proxy;
        if (__proxy) {
            this.options.proxies.push(__proxy);
            this.options.proxy = undefined;
        }
        
        return await this.useProxies(() => this._search(query));
    }

    private async _search(query: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const agent = this.options.proxy ? HttpsProxyAgent({
                host: this.options.proxy?.host,
                port: this.options.proxy?.port,
                auth: this.options.proxy?.auth?.username + ':' + this.options.proxy?.auth?.password
            }) : new https.Agent({
                rejectUnauthorized: false
            });
            
            return await axios(Object.assign({
                url: _url(`https://www.google.com/search`, this.options.queries),
                method: 'GET',
                headers: this.options.headers
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
                const results: any[] = [];
                const stats: any = {};
                const relatedSearches: any[] = [];

                $('#search .g').each((i, elem) => {
                    if ($(elem).hasClass('VjDLd')) return;
                    const favicon = $(elem).find('img').first().attr('src');
                    const title = $(elem).find('.DKV0Md').first().text();
                    const link = $(elem).find('a').first().attr('href');
                    const description = $(elem).find('.yDYNvb').first().text();
                    const deepLinks: any[] = [];

                    $(elem).find('.mslg').each((i, elem) => {
                        const h3 = $(elem).find('h3').text();
                        const link = $(elem).find('a').attr('href');
                        const description = $(elem).find('.zz3gNc').text();

                        deepLinks.push({
                            title: h3,
                            link: link?.replace('/url?q=', ''),
                            description
                        });
                    });

                    $(elem).find('.XN9cAe').each((i, elem) => {
                        const h3 = $(elem).find('h3').text();
                        const link = $(elem).find('a').attr('href');
                        const description = $(elem).find('.yDYNvb').text();

                        deepLinks.push({
                            title: h3,
                            link: link?.replace('/url?q=', ''),
                            description
                        });
                    });

                    results.push({
                        favicon,
                        title,
                        link,
                        description,
                        deepLinks
                    });
                });

                const resultStats = $('#result-stats').text();
                if (resultStats.match(/\(([^)]+)\)/)) {
                    const onlyInBrackets = resultStats.match(/\(([^)]+)\)/);
                    const onlyNumbers = resultStats.split(onlyInBrackets[0])[0].match(/\d+/g).join('');
                    stats.totalResults = Number(onlyNumbers);
                    stats.timeTaken = onlyInBrackets[1];
                }

                $('#botstuff').each((i, elem) => {
                    $(elem).find('b').each((i, elem) => {
                        relatedSearches.push($(elem).text());
                    });
                });

                const data = {
                    results,
                    relatedSearches,
                    stats,
                    proxy: this.options.proxy,
                    queries: this.options.queries
                };

                return resolve(data);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    public async suggestions(query: string): Promise<{}> {
        if (!this.options?.queries?.q) this.updateQueries('q', query);
        this.updateQueries('cp', 6);
        this.updateQueries('xssi', 't');
        this.updateQueries('authuser', 0);
        this.updateQueries('client', 'gws-wiz');
        this.updateQueries('dpr', 1);

        const __proxy = this.options.proxy;
        if (__proxy) {
            this.options.proxies.push(__proxy);
            this.options.proxy = undefined;
        }

        return await this.useProxies(() => this._suggestions(query));
    }

    private async _suggestions(query: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const agent = this.options.proxy ? HttpsProxyAgent({
                host: this.options.proxy?.host,
                port: this.options.proxy?.port,
                auth: this.options.proxy?.auth?.username + ':' + this.options.proxy?.auth?.password
            }) : new https.Agent({
                rejectUnauthorized: false
            });

            return await axios(Object.assign({
                url: _url(`https://www.google.com/complete/search`, this.options.queries),
                method: 'GET',
                headers: this.options.headers
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
                const suggestions: any[] = [];
                const _data = html.split(')]}\'')[1];
                const json = JSON.parse(_data);

                json[0].forEach((elem: any) => {
                    const string = elem[0];
                    const type = elem[1];
                    const weight = elem[2];
                    const data = elem[3];

                    suggestions.push({
                        string: {
                            text: string.replace(/<b>/g, '').replace(/<\/b>/g, ''),
                            html: string,
                            markdown: string.replace(/<b>/g, '**').replace(/<\/b>/g, '**')
                        },
                        type,
                        weight,
                        data
                    });
                });

                const data = {
                    suggestions,
                    proxy: this.options.proxy,
                    queries: this.options.queries
                };

                return resolve(data);
            }).catch(error => {
                console.log(error);
                return reject(error);
            });
        });
    }

    public async images(query: string): Promise<{}> {
        return new Error('Not implemented yet');
    }
}