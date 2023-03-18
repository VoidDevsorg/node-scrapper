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
exports.Wikipedia = void 0;
const axios_1 = __importDefault(require("axios"));
const Wikipedia_1 = require("../../types/Wikipedia");
const cheerio = __importStar(require("cheerio"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const handleUrl_1 = __importDefault(require("../../utils/handleUrl"));
const useProxies_1 = __importDefault(require("../../utils/useProxies"));
const https_1 = __importDefault(require("https"));
class Wikipedia {
    options = (0, Wikipedia_1.getOptions)();
    updateQueries;
    constructor(options = (0, Wikipedia_1.getOptions)()) {
        let _options = {
            ...(0, Wikipedia_1.getOptions)(),
            ...options
        };
        function updateQueries(name, value) {
            _options.queries = {
                ..._options.queries,
                [name]: value
            };
        }
        this.updateQueries = updateQueries;
        this.options = _options;
    }
    useProxies = useProxies_1.default;
    async get(query) {
        const __proxy = this.options.proxy;
        if (__proxy) {
            this.options.proxies.push(__proxy);
            this.options.proxy = undefined;
        }
        return await this.useProxies(() => this._get(query));
    }
    async _get(query) {
        return new Promise(async (resolve, reject) => {
            const agent = this.options.proxy ? (0, https_proxy_agent_1.default)({
                host: this.options.proxy?.host,
                port: this.options.proxy?.port,
                auth: this.options.proxy?.auth ? this.options.proxy?.auth?.username + ':' + this.options.proxy?.auth?.password : undefined
            }) : new https_1.default.Agent({
                rejectUnauthorized: false
            });
            return await (0, axios_1.default)(Object.assign({
                url: (0, handleUrl_1.default)(`https://${this.options.language}.wikipedia.org/wiki/${query.replace(/ /g, '_')}`, this.options.queries),
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
                let result = {
                    title: undefined,
                    image: undefined,
                    description: {
                        clean: undefined,
                        links: undefined,
                        markdown: undefined
                    },
                    infobox: undefined
                };
                const fixText = (text) => text.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ').trim();
                const formatLink = (text) => {
                    let _ = text;
                    const regex = /\(([^)]+)\)/;
                    const match = regex.exec(_);
                    if (match) {
                        const m = match[1];
                        _ = _.replace(`_(${m})`, '');
                    }
                    _ = _.replace('/wiki/', '').replace(/_/g, '+').toLowerCase();
                    if (_.endsWith('.'))
                        _ = _.slice(0, _.length - 1);
                    return `https://nustry.com/search?q=${_}`;
                };
                $('.mw-parser-output').each((i, element) => {
                    const $element = $(element);
                    const $p = $element.find('p').not('.mw-empty-elt');
                    $p.find('sup').remove();
                    $p.first().each((i, element) => {
                        const $element = $(element);
                        const text = $element.text();
                        const links = [];
                        $element.find('a').each((i, element) => {
                            const $element = $(element);
                            const href = $element.attr('href');
                            if (href && href.startsWith('/wiki/')) {
                                links.push({
                                    href: href,
                                    text: $element.text()
                                });
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
                    let values = [];
                    $tr.each((i, element) => {
                        const $element = $(element);
                        const $th = $element.find('th');
                        const $td = $element.find('td');
                        $td.find('sup').remove();
                        const th = $th.text();
                        if (!th)
                            return;
                        const isHaveLI = $td.find('li').length > 0;
                        const isHaveTable = $td.find('table').length > 0;
                        const isHaveBR = $td.find('br').length > 0;
                        let res = [fixText($td.text())];
                        if (isHaveLI) {
                            const $li = $td.find('li');
                            const li = [];
                            $li.each((i, element) => {
                                const $element = $(element);
                                li.push(fixText($element.text()));
                            });
                            res = li;
                        }
                        else if (isHaveTable) {
                            const $table = $td.find('table');
                            const table = {};
                            $table.each((i, element) => {
                                const $element = $(element);
                                const $tr = $element.find('tr');
                                $tr.each((i, element) => {
                                    const $element = $(element);
                                    const $th = $element.find('th');
                                    const $td = $element.find('td');
                                    const th = fixText($th.text());
                                    if (!th)
                                        return;
                                    table[th] = fixText($td.text());
                                });
                            });
                            res = table;
                        }
                        else if (isHaveBR) {
                            const removeTags = (text) => text.replace(/(<([^>]+)>)/gi, '');
                            res = $td.html().split('<br>').map((text) => {
                                return fixText(removeTags(text));
                            });
                        }
                        const response = res;
                        const $a = $td.find('a');
                        const href = $a.attr('href');
                        let links = [];
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
                    result['infobox'] = values;
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
exports.Wikipedia = Wikipedia;
