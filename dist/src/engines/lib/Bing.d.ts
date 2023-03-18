import { Options } from "../../types/Bing";
import useProxies from "../../utils/useProxies";
export declare class Bing {
    private options;
    private updateQueries;
    constructor(options?: Options);
    useProxies: typeof useProxies;
    search(query: string): Promise<{}>;
    private _search;
    suggestions(query: string): Promise<{}>;
    private _suggestions;
    images(query: string): Promise<{}>;
}
