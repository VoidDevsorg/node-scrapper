import axios from "axios";
import { getOptions, Options } from "../../types/YouTube";
import * as cheerio from 'cheerio';
import HttpsProxyAgent from 'https-proxy-agent';
import _url from "../../utils/handleUrl";
import useProxies from "../../utils/useProxies";
import https from 'https';

export class YouTube {
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
    public async search(query: string): Promise<{}> {
        this.updateQueries('search_query', encodeURIComponent(query));
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
                url: _url(`https://www.youtube.com/results`, this.options.queries),
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

                let results: any[] = [];
                $('script').each((index, element) => {
                    const text = $(element).text();
                    if (text.includes('ytInitialData')) {
                        const regex = /var ytInitialData = \{(.|\n)*\}/gm;
                        const data = text.match(regex);
                        if (data) {
                            const json = JSON.parse(data[0].replace('var ytInitialData = ', ''));
                            const contents = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter((content: any) => content.videoRenderer);
                            for (let i = 0; i < contents.length; i++) {
                                const content = contents[i];
                                if (content.videoRenderer) {
                                    const video = content.videoRenderer;
                                    const result = {
                                        id: video.videoId,
                                        title: video.title.runs[0].text,
                                        description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((run: any) => run.text).join('') || null,
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