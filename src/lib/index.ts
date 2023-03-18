import * as Engines from '../engines';

// TYPES
import { getOptions as getGoogleOptions, Options as GoogleOptions } from '../types/Google';
import { getOptions as getBingOptions, Options as BingOptions } from '../types/Bing';
import { getOptions as getWikipediaOptions, Options as WikipediaOptions } from '../types/Wikipedia';
import { getOptions as getYouTubeOptions, Options as YouTubeOptions } from '../types/YouTube';


export default {
    /*
        *   Google
        @param query: string
        @param options: GoogleOptions
        @param engine: 0 = Google, 1 = Google Suggestions
    */
    google: (query: string, options: GoogleOptions = getGoogleOptions(), engine: 0 | 1 = 0) => {
        if (engine === 0) return new Engines.Google(options).search(query);
        else if (engine === 1) return new Engines.Google(options).suggestions(query);

        return new Engines.Google(options).search(query);
    },
    /*
        *   Bing
        @param query: string
        @param options: GoogleOptions
        @param engine: 0 = Google, 1 = Google Suggestions
    */
    bing: (query: string, options: BingOptions = getBingOptions(), engine: 0 | 1 = 0) => {
        if (engine === 0) return new Engines.Bing(options).search(query);
        else if (engine === 1) return new Engines.Bing(options).suggestions(query);

        return new Engines.Bing(options).search(query);
    },
    wikipedia: (query: string, options: WikipediaOptions = getWikipediaOptions()) => {
        return new Engines.Wikipedia(options).get(query);
    },
    youtube: (query: string, options: YouTubeOptions = getYouTubeOptions()) => {
        return new Engines.YouTube(options).search(query);
    }
}; 