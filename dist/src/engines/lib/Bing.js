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
exports.Bing = void 0;
const axios_1 = __importDefault(require("axios"));
const Bing_1 = require("../../types/Bing");
const cheerio = __importStar(require("cheerio"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const handleUrl_1 = __importDefault(require("../../utils/handleUrl"));
const useProxies_1 = __importDefault(require("../../utils/useProxies"));
const https_1 = __importDefault(require("https"));
class Bing {
    options = (0, Bing_1.getOptions)();
    updateQueries;
    constructor(options = (0, Bing_1.getOptions)()) {
        let _options = {
            ...(0, Bing_1.getOptions)(),
            ...options
        };
        function updateQueries(name, value) {
            _options.queries = {
                ..._options.queries,
                [name]: value
            };
        }
        if (_options?.mkt) {
            if (!_options?.queries?.mkt)
                updateQueries('mkt', _options?.mkt);
            if (!_options?.queries?.setlang)
                updateQueries('setlang', _options?.mkt);
        }
        if (_options?.safe) {
            if (!_options?.queries?.safe)
                updateQueries('safeSearch', _options?.safe);
        }
        if (_options?.perPage) {
            if (!_options?.queries?.count)
                updateQueries('count', _options?.perPage);
            if (!_options?.queries?.offset)
                updateQueries('offset', (_options?.perPage * (_options?.page - 1)));
        }
        if (!_options?.queries?.pt)
            updateQueries('pt', 'page.serp');
        if (!_options?.queries?.mkt)
            updateQueries('mkt', 'en-us');
        if (!_options?.queries?.cp)
            updateQueries('cp', 6);
        if (!_options?.queries?.msbqf)
            updateQueries('msbqf', false);
        if (!_options?.queries?.cvid)
            updateQueries('cvid', 'void_development');
        this.updateQueries = updateQueries;
        this.options = _options;
    }
    useProxies = useProxies_1.default;
    async search(query) {
        if (!this.options?.queries?.bq)
            this.updateQueries('bq', query);
        if (!this.options?.queries?.q)
            this.updateQueries('q', query);
        if (!this.options?.queries?.qry)
            this.updateQueries('qry', query);
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
                url: (0, handleUrl_1.default)(`https://www.bing.com/search`, this.options.queries),
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
                $('#b_results .b_algo').each((i, el) => {
                    const title = $(el).find('h2 a').first().text();
                    const description = $(el).find('.b_algoSlug').each((i, el) => {
                        $(el).find('span').remove();
                    }).text();
                    const link = $(el).find('a').first().attr('href');
                    const deepLinks = [];
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
    async suggestions(query) {
        if (!this.options?.queries?.bq)
            this.updateQueries('bq', query);
        if (!this.options?.queries?.q)
            this.updateQueries('q', query);
        if (!this.options?.queries?.qry)
            this.updateQueries('qry', query);
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
                url: (0, handleUrl_1.default)(`https://www.bing.com/AS/Suggestions`, this.options.queries),
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
                const suggestions = [];
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
    async images(query) {
        return new Error('Not implemented yet');
    }
}
exports.Bing = Bing;
