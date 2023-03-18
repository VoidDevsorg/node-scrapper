"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Engines = __importStar(require("../engines"));
// TYPES
const Google_1 = require("../types/Google");
const Bing_1 = require("../types/Bing");
const Wikipedia_1 = require("../types/Wikipedia");
const YouTube_1 = require("../types/YouTube");
exports.default = {
    /*
        *   Google
        @param query: string
        @param options: GoogleOptions
        @param engine: 0 = Google, 1 = Google Suggestions
    */
    google: (query, options = (0, Google_1.getOptions)(), engine = 0) => {
        if (engine === 0)
            return new Engines.Google(options).search(query);
        else if (engine === 1)
            return new Engines.Google(options).suggestions(query);
        return new Engines.Google(options).search(query);
    },
    /*
        *   Bing
        @param query: string
        @param options: GoogleOptions
        @param engine: 0 = Google, 1 = Google Suggestions
    */
    bing: (query, options = (0, Bing_1.getOptions)(), engine = 0) => {
        if (engine === 0)
            return new Engines.Bing(options).search(query);
        else if (engine === 1)
            return new Engines.Bing(options).suggestions(query);
        return new Engines.Bing(options).search(query);
    },
    wikipedia: (query, options = (0, Wikipedia_1.getOptions)()) => {
        return new Engines.Wikipedia(options).get(query);
    },
    youtube: (query, options = (0, YouTube_1.getOptions)()) => {
        return new Engines.YouTube(options).search(query);
    }
};
