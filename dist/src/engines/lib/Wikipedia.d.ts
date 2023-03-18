import { Options } from "../../types/Wikipedia";
import useProxies from "../../utils/useProxies";
export declare class Wikipedia {
    private options;
    private updateQueries;
    constructor(options?: Options);
    useProxies: typeof useProxies;
    get(query: string): Promise<{}>;
    private _get;
}
