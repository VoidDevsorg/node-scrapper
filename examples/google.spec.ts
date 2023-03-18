import { Google } from '../src';
const google = new Google({
    mkt: 'tr-TR',
    perPage: 5,
    safe: 'off',
    proxies: [
        // ...
    ]
});

google.suggestions('Google').then(data => {
    console.log(data);
}).catch(error => {
    console.log(error);
});
