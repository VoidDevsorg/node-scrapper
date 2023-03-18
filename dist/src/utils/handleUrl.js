"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function _url(url, queries) {
    if (url.includes('?')) {
        url += '&' + Object.keys(queries || {}).map(key => `${key}=${queries[key]}`).join('&');
    }
    else {
        url += '?' + Object.keys(queries || {}).map(key => `${key}=${queries[key]}`).join('&');
    }
    return url;
}
exports.default = _url;
