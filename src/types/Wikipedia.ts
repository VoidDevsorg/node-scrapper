import getAgent from "../utils/getAgent";

export const getOptions = (): Options => {
    return {
        language: 'en',
        headers: {
            'Connection': 'keep-alive',
            'Host': 'www.wikipedia.com',
            'Pragma': 'no-cache',
            'Referer': 'https://www.wikipedia.com/',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-full-version': '"110.0.5481.178"',
            'sec-ch-ua-full-version-list': '"Chromium";v="110.0.5481.178", "Not A(Brand";v="24.0.0.0", "Google Chrome";v="110.0.5481.178"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"10.0.0"',
            'sec-ch-ua-wow64': '?0',
            'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
            'User-Agent': getAgent()
        }
    }

}

export interface _proxy {
    host: string;
    port: number;
    auth?: {
        username: string;
        password: string;
    }
}

export interface Options {
    language?: string;
    headers?: {
        [key: string]: any;
    }
    proxy?: _proxy;
    proxies?: _proxy[];
    queries?: {
        [key: string]: any;
    } | undefined;
}