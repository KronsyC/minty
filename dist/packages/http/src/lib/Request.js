"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GLFn(event, callback) { }
class HTTPRequest {
    constructor(req) {
        this.on = (event, callback) => {
            this.rawRequest.on(event, callback);
        };
        this.off = (event, callback) => {
            this.rawRequest.off(event, callback);
        };
        this.once = (event, callback) => {
            this.rawRequest.once(event, callback);
        };
        //#region listener functions
        this.addListener = (event, callback) => {
            return this.rawRequest.addListener(event, callback);
        };
        this.removeListener = (event, callback) => {
            return this.rawRequest.removeListener(event, callback);
        };
        this.prependListener = (event, callback) => {
            return this.rawRequest.prependListener(event, callback);
        };
        this.prependOnceListener = (event, callback) => {
            return this.rawRequest.prependOnceListener(event, callback);
        };
        this.rawRequest = req;
    }
    unshift(chunk, encoding) {
        return this.rawRequest.unshift(chunk, encoding);
    }
    unpipe(destination) {
        return this.rawRequest.unpipe(destination);
    }
    wrap(stream) {
        return this.rawRequest.wrap(stream);
    }
    setEncoding(encoding) {
        return this.rawRequest.setEncoding(encoding);
    }
    resume() {
        return this.rawRequest.resume();
    }
    pause() {
        return this.rawRequest.pause();
    }
    pipe(destination, options) {
        return this.rawRequest.pipe(destination, options);
    }
    push(chunk, encoding) {
        return this.rawRequest.push(chunk, encoding);
    }
    isPaused() {
        return this.rawRequest.isPaused();
    }
    eventNames() {
        return this.rawRequest.eventNames();
    }
    emit(event) {
        this.rawRequest.emit(event);
    }
    destroy(err) {
        return this.rawRequest.destroy(err);
    }
    get rawTrailers() {
        return this.rawRequest.rawTrailers;
    }
    get trailers() {
        return this.rawRequest.trailers;
    }
    get socket() {
        return this.rawRequest.socket;
    }
    get rawHeaders() {
        return this.rawRequest.rawHeaders;
    }
    get method() {
        return this.rawRequest.method;
    }
    get url() {
        return this.rawRequest.url || '/';
    }
    get headers() {
        return this.rawRequest.headers;
    }
    get httpVersion() {
        return this.rawRequest.httpVersion;
    }
    get httpVersionMajor() {
        return this.rawRequest.httpVersionMajor;
    }
    get httpVersionMinor() {
        return this.rawRequest.httpVersionMinor;
    }
    get aborted() {
        return this.rawRequest.aborted;
    }
    get complete() {
        return this.rawRequest.complete;
    }
    get destroyed() {
        return this.rawRequest.destroyed;
    }
    read(size) {
        return this.rawRequest.read(size);
    }
    rawListeners(event) {
        return this.rawRequest.rawListeners(event);
    }
    getMaxListeners() {
        return this.rawRequest.getMaxListeners();
    }
    setMaxListeners(n) {
        return this.rawRequest.setMaxListeners(n);
    }
    removeAllListeners() {
        return this.rawRequest.removeAllListeners();
    }
    listeners() {
        return this.rawRequest.listeners;
    }
    listenersCount() {
        return this.rawRequest.listenerCount;
    }
    //#endregion
    //#region readability getters
    get readable() {
        return this.rawRequest.readable;
    }
    get readableAborted() {
        return this.rawRequest.readableAborted;
    }
    get readableDidRead() {
        return this.rawRequest.readableDidRead;
    }
    get readableEncoding() {
        return this.rawRequest.readableEncoding;
    }
    get readableEnded() {
        return this.rawRequest.readableEnded;
    }
    get readableFlowing() {
        return this.rawRequest.readableFlowing;
    }
    get readableHighWaterMark() {
        return this.rawRequest.readableHighWaterMark;
    }
    get readableLength() {
        return this.rawRequest.readableLength;
    }
    get readableObjectMode() {
        return this.rawRequest.readableObjectMode;
    }
}
exports.default = HTTPRequest;
//# sourceMappingURL=Request.js.map