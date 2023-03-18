import { Options as GoogleOptions } from '../types/Google';
import { Options as BingOptions } from '../types/Bing';
import { Options as WikipediaOptions } from '../types/Wikipedia';
import { Options as YouTubeOptions } from '../types/YouTube';
declare const _default: {
    google: (query: string, options?: GoogleOptions, engine?: 0 | 1) => Promise<{}>;
    bing: (query: string, options?: BingOptions, engine?: 0 | 1) => Promise<{}>;
    wikipedia: (query: string, options?: WikipediaOptions) => Promise<{}>;
    youtube: (query: string, options?: YouTubeOptions) => Promise<{}>;
};
export default _default;
