"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
class Headers {
    constructor(rawHeaders) {
        for (let header in rawHeaders) {
            this[header] = rawHeaders[header];
        }
    }
}
class Request {
    constructor(req) {
        this.rawRequest = req;
        this.headers = new Headers(req.headers);
    }
    get query() {
        return this[symbols_1.kQuery];
    }
    get params() {
        return this[symbols_1.kParams];
    }
    get body() {
        return this[symbols_1.kBody];
    }
    get path() {
        return this.rawRequest.url.split("?")[0];
    }
    get method() {
        return this.rawRequest.method;
    }
    get source() {
        return {
            ip: this.rawRequest.socket.remoteAddress,
            port: this.rawRequest.socket.remotePort
        };
    }
    get httpVersion() {
        const version = this.rawRequest.httpVersion;
        return version;
    }
}
exports.default = Request;
//# sourceMappingURL=Request.js.map