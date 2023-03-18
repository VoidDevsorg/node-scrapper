"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAgent() {
    const agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}
exports.default = getAgent;
