import { Engine } from '../src';

Engine.google('Google', {
    mkt: 'tr-TR',
    perPage: 20,
    safe: 'off',
    proxies: [
        // ...
    ]
}, 0).then(data => {
    console.log(data);
}).catch(error => {
    console.log(error);
});
