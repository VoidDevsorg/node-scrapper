import { YouTube } from '../src';
const youtube = new YouTube({
    proxies: [
        // ...
    ]
});

youtube.search('Barış Özcan').then(data => {
    console.log(data);
}).catch(error => {
    console.log(error);
});
