export declare const getOptions: () => Options;
export interface _proxy {
    host: string;
    port: number;
    auth?: {
        username: string;
        password: string;
    };
}
export interface Options {
    mkt?: string;
    page?: number;
    perPage?: number;
    safe?: 'off' | 'active' | 'high' | 'medium' | 'safeUndefined';
    headers?: {
        [key: string]: any;
    };
    proxy?: _proxy;
    proxies?: _proxy[];
    queries?: {
        [key: string]: any;
    } | undefined;
}
