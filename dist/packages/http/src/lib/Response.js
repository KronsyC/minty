"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HTTPResponse {
    constructor(res) {
        this.sendResponse = undefined;
        this.rawResponse = res;
        res.addListener("close", () => {
        });
    }
    get writable() {
        return this.rawResponse.writable;
    }
    uncork() {
        this.rawResponse.uncork();
    }
    get statusMessage() {
        return this.rawResponse.statusMessage;
    }
    set statusMessage(status) {
        this.rawResponse.statusMessage = status;
    }
    get statusCode() {
        return this.rawResponse.statusCode;
    }
    set statusCode(status) {
        this.rawResponse.statusCode = status;
    }
    get sendDate() {
        return this.rawResponse.sendDate;
    }
    pipe(destination, options) {
        return this.rawResponse.pipe(destination, options);
    }
    get destroyed() {
        return this.rawResponse.destroyed;
    }
    destroy(error) {
        return this.rawResponse.destroy(error);
    }
    cork() {
        this.rawResponse.cork();
    }
    addTrailers(trailers) {
        this.rawResponse.addTrailers(trailers);
    }
    get req() {
        return this.rawResponse.req;
    }
    end(data, cb) {
        this.rawResponse.end(data, cb);
    }
    addListener(event, listener) {
        return this.on(event, listener);
    }
    listenerCount(event) {
        return this.rawResponse.listenerCount(event);
    }
    listeners(event) {
        return this.rawResponse.listeners(event);
    }
    rawListeners(event) {
        return this.rawResponse.rawListeners(event);
    }
    getMaxListeners() {
        return this.rawResponse.getMaxListeners();
    }
    removeListener(event, listener) {
        this.rawResponse.removeListener(event, listener);
    }
    setMaxListeners(count) {
        this.rawResponse.setMaxListeners(count);
    }
    prependListener(event, listener) {
        this.rawResponse.prependListener(event, listener);
    }
    prependOnceListener(event, listener) {
        this.rawResponse.prependListener(event, listener);
    }
    removeAllListeners(event) {
        this.rawResponse.removeAllListeners(event);
    }
    off(event, listener) {
        return this.removeListener(event, listener);
    }
    on(event, listener) {
        return this.rawResponse.on(event, listener);
    }
    eventNames() {
        return this.rawResponse.eventNames();
    }
    emit(event) {
        return this.rawResponse.emit(event);
    }
    //#endregion
    //#region Header Methods
    get headersSent() {
        return this.rawResponse.headersSent;
    }
    getHeader(name) {
        return this.rawResponse.getHeader(name);
    }
    getHeaders() {
        return this.rawResponse.getHeaders();
    }
    getHeaderNames() {
        return this.rawResponse.getHeaderNames();
    }
    hasHeader(name) {
        return this.rawResponse.hasHeader(name);
    }
    setHeader(name, value) {
        this.rawResponse.setHeader(name.toLowerCase(), value);
    }
}
exports.default = HTTPResponse;
//# sourceMappingURL=Response.js.map