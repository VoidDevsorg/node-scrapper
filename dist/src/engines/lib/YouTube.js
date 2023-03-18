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
exports.YouTube = void 0;
const axios_1 = __importDefault(require("axios"));
const YouTube_1 = require("../../types/YouTube");
const cheerio = __importStar(require("cheerio"));
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const handleUrl_1 = __importDefault(require("../../utils/handleUrl"));
const useProxies_1 = __importDefault(require("../../utils/useProxies"));
const https_1 = __importDefault(require("https"));
class YouTube {
    options = (0, YouTube_1.getOptions)();
    updateQueries;
    constructor(options = (0, YouTube_1.getOptions)()) {
        let _options = {
            ...(0, YouTube_1.getOptions)(),
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
    async search(query) {
        this.updateQueries('search_query', encodeURIComponent(query));
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
                url: (0, handleUrl_1.default)(`https://www.youtube.com/results`, this.options.queries),
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
            } : {}))).then((response) => {
                const html = response.data;
                const $ = cheerio.load(html);
                let results = [];
                $('script').each((index, element) => {
                    const text = $(element).text();
                    if (text.includes('ytInitialData')) {
                        const regex = /var ytInitialData = \{(.|\n)*\}/gm;
                        const data = text.match(regex);
                        if (data) {
                            const json = JSON.parse(data[0].replace('var ytInitialData = ', ''));
                            const contents = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter((content) => content.videoRenderer);
                            for (let i = 0; i < contents.length; i++) {
                                const content = contents[i];
                                if (content.videoRenderer) {
                                    const video = content.videoRenderer;
                                    const result = {
                                        id: video.videoId,
                                        title: video.title.runs[0].text,
                                        description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((run) => run.text).join('') || null,
                                        duration: video.lengthText?.simpleText,
                                        views: Number(video.viewCountText?.simpleText?.replace(/[^0-9]/g, '')),
                                        thumbnail: video.thumbnail.thumbnails[0].url,
                                        channel: {
                                            id: video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                                            name: video.ownerText.runs[0].text,
                                            url: video.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                                            verified: video.ownerBadges[0]?.metadataBadgeRenderer.tooltip === 'Verified' ? true : false
                                        },
                                        url: video.navigationEndpoint.commandMetadata.webCommandMetadata.url,
                                        published: video.publishedTimeText?.simpleText
                                    };
                                    results.push(result);
                                }
                            }
                        }
                    }
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
}
exports.YouTube = YouTube;
