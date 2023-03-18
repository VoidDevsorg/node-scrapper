"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Google = void 0;
const axios_1 = __importDefault(require("axios"));
const Google_1 = require("../../types/Google");
const cheerio = __importStar(require("cheerio"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const handleUrl_1 = __importDefault(require("../../utils/handleUrl"));
const useProxies_1 = __importDefault(require("../../utils/useProxies"));
const https_1 = __importDefault(require("https"));
class Google {
    options = (0, Google_1.getOptions)();
    updateQueries;
    constructor(options = (0, Google_1.getOptions)()) {
        let _options = {
            ...(0, Google_1.getOptions)(),
            ...options
        };
        function updateQueries(name, value) {
            _options.queries = {
                ..._options.queries,
                [name]: value
            };
        }
        if (_options?.mkt) {
            if (!_options?.queries?.lr)
                updateQueries('lr', 'lang_' + (_options?.mkt?.split('-')?.[0] || 'en'));
            if (!_options?.queries?.hl)
                updateQueries('hl', _options?.mkt?.split('-')?.[0] || 'en');
            if (!_options?.queries?.gl)
                updateQueries('gl', _options?.mkt?.split('-')?.[1] || 'US');
        }
        if (_options?.safe) {
            if (!_options?.queries?.safe)
                updateQueries('safe', _options?.safe);
        }
        if (_options?.perPage) {
            if (!_options?.queries?.num)
                updateQueries('num', _options?.perPage);
            if (!_options?.queries?.start)
                updateQueries('start', (_options?.page - 1) * _options?.perPage);
        }
        this.updateQueries = updateQueries;
        this.options = _options;
    }
    useProxies = useProxies_1.default;
    async search(query) {
        if (!this.options?.queries?.q)
            this.updateQueries('q', query);
        const __proxy = this.options.proxy;
        if (__proxy) {
            this.options.proxies.push(__proxy);
            this.options.proxy = undefined;
        }
        return await this.useProxies(() => this._search(query));
    }
    async _search(query) {
        return new Promise(async (resolve, reject) => {
            const agent = this.options.proxy ? (0, https_proxy_agent_1.default)({
                host: this.options.proxy?.host,
                port: this.options.proxy?.port,
                auth: this.options.proxy?.auth?.username + ':' + this.options.proxy?.auth?.password
            }) : new https_1.default.Agent({
                rejectUnauthorized: false
            });
            return await (0, axios_1.default)(Object.assign({
                url: (0, handleUrl_1.default)(`https://www.google.com/search`, this.options.queries),
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
                const results = [];
                const stats = {};
                const relatedSearches = [];
                $('#search .g').each((i, elem) => {
                    if ($(elem).hasClass('VjDLd'))
                        return;
                    const favicon = $(elem).find('img').first().attr('src');
                    const title = $(elem).find('.DKV0Md').first().text();
                    const link = $(elem).find('a').first().attr('href');
                    const description = $(elem).find('.yDYNvb').first().text();
                    const deepLinks = [];
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
    async suggestions(query) {
        if (!this.options?.queries?.q)
            this.updateQueries('q', query);
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
    async _suggestions(query) {
        return new Promise(async (resolve, reject) => {
            const agent = this.options.proxy ? (0, https_proxy_agent_1.default)({
                host: this.options.proxy?.host,
                port: this.options.proxy?.port,
                auth: this.options.proxy?.auth?.username + ':' + this.options.proxy?.auth?.password
            }) : new https_1.default.Agent({
                rejectUnauthorized: false
            });
            return await (0, axios_1.default)(Object.assign({
                url: (0, handleUrl_1.default)(`https://www.google.com/complete/search`, this.options.queries),
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
                const suggestions = [];
                const _data = html.split(')]}\'')[1];
                const json = JSON.parse(_data);
                json[0].forEach((elem) => {
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
    async images(query) {
        return new Error('Not implemented yet');
    }
}
exports.Google = Google;
