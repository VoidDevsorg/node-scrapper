"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = void 0;
const getAgent_1 = __importDefault(require("../utils/getAgent"));
const getOptions = () => {
    return {
        headers: {
            'Connection': 'keep-alive',
            'Host': 'www.youtube.com',
            'Pragma': 'no-cache',
            'Referer': 'https://www.youtube.com/results?search_query=',
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
            'User-Agent': (0, getAgent_1.default)()
        }
    };
};
exports.getOptions = getOptions;
