# @voidpkg/scrapper

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][node-url]

## Community
If you have any questions or want to help, join our [Discord](https://discord.gg/voiddevs) server.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install @voidpkg/scrapper
```

## Usage

```js
const { Engine } = require('@voidpkg/scrapper');

Engine.google('Void Development', {
    proxies: [
        {
            host: '0.0.0.0',
            port: 8080,
            auth?: {
                username: 'clqu',
                password: '123456'
            }
        }
    ]
}).then(console.log).catch(console.error);
```

## Engine API
```js
/*
    types: 0 = Search, 1 = Suggestions, 2 = Images
*/

Engine.google(query, options, type);
Engine.bing(query, options, type);
Engine.youtube(query, options);
Engine.wikipedia(query, options);
```

## With Constructor
```js
const { Google, Bing, YouTube, Wikipedia } = require('@voidpkg/scrapper');
const proxies = [
    {
        host: '0.0.0.0',
        port: 8080,
        auth?: {
            username: 'clqu',
            password: '123456'
        }
    }
];

const google = new Google({ proxies });
const bing = new Bing({ proxies });
const youtube = new YouTube({ proxies });
const wikipedia = new Wikipedia({ proxies });

// Search
google.search('Void Development').then(console.log).catch(console.error);
bing.search('Void Development').then(console.log).catch(console.error);
youtube.search('Void Development').then(console.log).catch(console.error);
wikipedia.get('Void Development').then(console.log).catch(console.error);

// Suggestions
google.suggestions('Void Development').then(console.log).catch(console.error);
bing.suggestions('Void Development').then(console.log).catch(console.error);
```


## Engines

| Name | State 
|------|----------|
| Google Search |  ✅
| Google Suggestions |  ✅
| Google Images |  ❌
| Bing Search |  ✅
| Bing Suggestions |  ✅
| Bing Images |  ❌
| Wikipedia Search |  ✅
| YouTube Videos Search |  ✅

## Options
<details>
<summary>Google</summary>

| Name | Required | Type | Default
|------|----------|----------|----------|
| mkt | ❌ | string | en-US
| page | ❌ | number | 1
| perPage | ❌ | number | 10
| safe | ❌ | off, active, high, medium, safeUndefined | off
| headers | ❌ | { [key: string]: any; } | undefined
| proxies | ❌ | proxy[] | undefined
| queries | ❌ | { [key: string]: any; } | undefined
</details>

<details>
<summary>Bing</summary>

| Name | Required | Type | Default
|------|----------|----------|----------|
| mkt | ❌ | string | en-US
| page | ❌ | number | 1
| perPage | ❌ | number | 10
| safe | ❌ | off, moderate, strict | off
| headers | ❌ | { [key: string]: any; } | undefined
| proxies | ❌ | proxy[] | undefined
| queries | ❌ | { [key: string]: any; } | undefined
</details>

<details>
<summary>YouTube</summary>

| Name | Required | Type | Default
|------|----------|----------|----------|
| headers | ❌ | { [key: string]: any; } | undefined
| proxies | ❌ | proxy[] | undefined
| queries | ❌ | { [key: string]: any; } | undefined
</details>

<details>
<summary>Wikipedia</summary>

| Name | Required | Type | Default
|------|----------|----------|----------|
| language | ❌ | string | en
| headers | ❌ | { [key: string]: any; } | undefined
| proxies | ❌ | proxy[] | undefined
| queries | ❌ | { [key: string]: any; } | undefined
</details>

<details>
<summary>Proxy</summary>

| Name | Required | Type
|------|----------|----------|
| host | ✅ | string
| port | ✅ | number
| auth | ❌ | { username: string; password: string; }
</details>

<br>

## How to get free proxies?
- [WebShare](https://webshare.io) (Recommended)
- [ProxyScrape](https://proxyscrape.com/free-proxy-list)
- [ProxyList](https://www.proxy-list.download/api/v1/get?type=https)
- [ProxyDB](https://proxydb.net/)
- [ProxyNova](https://www.proxynova.com/proxy-server-list/)

## License

[MIT](LICENSE)

[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/@voidpkg/scrapper
[npm-url]: https://npmjs.org/package/@voidpkg/scrapper
[npm-version-image]: https://badgen.net/npm/v/@voidpkg/scrapper