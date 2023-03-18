import { Bing } from '../src';
const bing = new Bing({
    mkt: 'tr-tr',
    perPage: 10,
    safe: 'off',
    proxies: [
        // ...
    ]
});

bing.search('Youtube').then(data => {
    console.log(data);
}).catch(error => {
    console.log(error);
});
