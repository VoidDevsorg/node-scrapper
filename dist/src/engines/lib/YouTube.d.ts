import { Options } from "../../types/YouTube";
import useProxies from "../../utils/useProxies";
export declare class YouTube {
    private options;
    private updateQueries;
    constructor(options?: Options);
    useProxies: typeof useProxies;
    search(query: string): Promise<{}>;
    private _search;
}
