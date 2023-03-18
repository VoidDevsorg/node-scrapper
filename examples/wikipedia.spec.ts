import { Wikipedia } from '../src';
const wikipedia = new Wikipedia({
    language: 'tr',
    proxies: [
        // ...
    ]
});

wikipedia.get('Google').then(data => {
    console.log(data);
}).catch(error => {
    console.log(error);
});
