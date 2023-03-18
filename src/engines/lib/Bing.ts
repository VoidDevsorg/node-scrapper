import axios from "axios";
import { getOptions, Options } from "../../types/Bing";
import * as cheerio from 'cheerio';
import HttpsProxyAgent from 'https-proxy-agent';
import _url from "../../utils/handleUrl";
import useProxies from "../../utils/useProxies";
import https from 'https';

export class Bing {
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
            if (!_options?.queries?.mkt) updateQueries('mkt', _options?.mkt);
            if (!_options?.queries?.setlang) updateQueries('setlang', _options?.mkt);
        }

        if (_options?.safe) {
            if (!_options?.queries?.safe) updateQueries('safeSearch', _options?.safe);
        }

        if (_options?.perPage) {
            if (!_options?.queries?.count) updateQueries('count', _options?.perPage);
            if (!_options?.queries?.offset) updateQueries('offset', (_options?.perPage * (_options?.page - 1)));
        }

        if (!_options?.queries?.pt) updateQueries('pt', 'page.serp');
        if (!_options?.queries?.mkt) updateQueries('mkt', 'en-us');
        if (!_options?.queries?.cp) updateQueries('cp', 6);
        if (!_options?.queries?.msbqf) updateQueries('msbqf', false);
        if (!_options?.queries?.cvid) updateQueries('cvid', 'void_development');

        this.updateQueries = updateQueries;
        this.options = _options;
    }

    useProxies = useProxies;
    public async search(query: string): Promise<{}> {
        if (!this.options?.queries?.bq) this.updateQueries('bq', query);
        if (!this.options?.queries?.q) this.updateQueries('q', query);
        if (!this.options?.queries?.qry) this.updateQueries('qry', query);
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
                url: _url(`https://www.bing.com/search`, this.options.queries),
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

                $('#b_results .b_algo').each((i, el) => {
                    const title = $(el).find('h2 a').first().text();
                    const description = $(el).find('.b_algoSlug').each((i, el) => {
                        $(el).find('span').remove();
                    }).text();
                    const link = $(el).find('a').first().attr('href');
                    const deepLinks: any[] = [];

                    $(el).find('.b_deep li').each((i, el) => {
                        deepLinks.push({
                            title: $(el).find('a').text(),
                            link: $(el).find('a').attr('href'),
                            description: $(el).find('p').text()
                        });
                    });

                    results.push({
                        title,
                        description,
                        link,
                        deepLinks
                    });
                });
                const data = {
                    results,
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
        if (!this.options?.queries?.bq) this.updateQueries('bq', query);
        if (!this.options?.queries?.q) this.updateQueries('q', query);
        if (!this.options?.queries?.qry) this.updateQueries('qry', query);
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
                url: _url(`https://www.bing.com/AS/Suggestions`, this.options.queries),
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
                const suggestions: any[] = [];

                $('#sa_ul li').each((i, el) => {
                    suggestions.push({
                        text: $(el).find('.pp_title').text() || $(el).find('.sa_tm_text').text() || null,
                        image: $(el).find('img').attr('src') ? 'https://th.bing.com' + $(el).find('img').attr('src') : null
                    });
                });

                const data = {
                    suggestions: suggestions.filter(s => s.text),
                    proxy: this.options.proxy,
                    queries: this.options.queries
                };

                return resolve(data);
            }).catch(error => {
                return reject(error);
            });
        });
    }

    public async images(query: string): Promise<{}> {
        return new Error('Not implemented yet');
    }
}