export default function _url(url: string, queries: {}): string {
    if (url.includes('?')) {
        url += '&' + Object.keys(queries || {}).map(key => `${key}=${(queries as any)[key]}`).join('&');
    } else {
        url += '?' + Object.keys(queries || {}).map(key => `${key}=${(queries as any)[key]}`).join('&');
    }

    return url;
}