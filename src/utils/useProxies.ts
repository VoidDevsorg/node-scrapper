export default function useProxies(callback: Function) {
    return new Promise(async (resolve, reject) => {
        try {
            const _proxy = Array.isArray(this.options.proxies);
            if (this.options.proxies && _proxy) {
                for (let i = 0; i < this.options.proxies.length; i++) {
                    const proxy = this.options.proxies[i];
                    this.options.proxy = proxy;
                    try {
                        const cb = await callback();
                        return resolve(cb);
                    } catch (error) {
                        if (this.options.proxies.length - 1 === i) {
                            throw new Error(error);
                        }
                        continue;
                    }
                }
            }

            const cb = await callback();
            return resolve(cb);
        } catch (error) {
            return reject(error);
        }
    })
}