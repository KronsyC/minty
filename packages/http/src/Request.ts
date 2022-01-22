import { BaseRequest as BaseRequest } from './types';
type RequestEvent =
    | 'aborted'
    | 'close'
    | 'data'
    | 'end'
    | 'error'
    | 'pause'
    | 'readable'
    | 'resume';

function GLFn(event: 'aborted', callback: (hadError: boolean, code: number) => void): void;
function GLFn(event: 'close', callback: () => void): void;
function GLFn(event: 'data', callback: (chunk: any) => void): void;
function GLFn(event: 'end', callback: () => void): void;
function GLFn(event: 'error', callback: (err: Error) => void): void;
function GLFn(event: 'pause', callback: () => void): void;
function GLFn(event: 'readable', callback: () => void): void;
function GLFn(event: 'resume', callback: () => void): void;
function GLFn(event: RequestEvent, callback: (arg1?: any, arg2?: any) => void): void {}
type GenericListenerFunction = typeof GLFn;

// This can probably be done 1000x better //FIXME: make this less terrible
export default class Request {
    public rawRequest: BaseRequest;
    constructor(req: BaseRequest) {
        this.rawRequest = req;
    }
    unshift(chunk: any, encoding?: BufferEncoding) {
        return this.rawRequest.unshift(chunk, encoding);
    }
    unpipe(destination: NodeJS.WritableStream): BaseRequest {
        return this.rawRequest.unpipe(destination);
    }
    wrap(stream: NodeJS.ReadableStream): BaseRequest {
        return this.rawRequest.wrap(stream);
    }
    setEncoding(encoding: BufferEncoding): BaseRequest {
        return this.rawRequest.setEncoding(encoding);
    }

    resume(): BaseRequest {
        return this.rawRequest.resume();
    }

    pause(): BaseRequest {
        return this.rawRequest.pause();
    }
    pipe(destination: NodeJS.WritableStream, options: { end?: boolean }) {
        return this.rawRequest.pipe(destination, options);
    }
    push(chunk: any, encoding?: BufferEncoding) {
        return this.rawRequest.push(chunk, encoding);
    }
    on: GenericListenerFunction = (event, callback) => {
        this.rawRequest.on(event, callback);
    };
    off: GenericListenerFunction = (event, callback) => {
        this.rawRequest.off(event, callback);
    };
    once: GenericListenerFunction = (event, callback) => {
        this.rawRequest.once(event, callback);
    };
    isPaused() {
        return this.rawRequest.isPaused();
    }

    eventNames() {
        return this.rawRequest.eventNames();
    }
    emit(event: RequestEvent) {
        this.rawRequest.emit(event);
    }
    destroy(err?: Error): BaseRequest {
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

    read(size: number) {
        return this.rawRequest.read(size);
    }

    //#region listener functions
    addListener: GenericListenerFunction = (event, callback) => {
        return this.rawRequest.addListener(event, callback);
    };
    rawListeners(event: RequestEvent) {
        return this.rawRequest.rawListeners(event);
    }
    getMaxListeners() {
        return this.rawRequest.getMaxListeners();
    }
    removeListener: GenericListenerFunction = (event, callback) => {
        return this.rawRequest.removeListener(event, callback);
    };
    setMaxListeners(n: number) {
        return this.rawRequest.setMaxListeners(n);
    }
    prependListener: GenericListenerFunction = (event, callback) => {
        return this.rawRequest.prependListener(event, callback);
    };
    removeAllListeners() {
        return this.rawRequest.removeAllListeners();
    }
    prependOnceListener: GenericListenerFunction = (event, callback) => {
        return this.rawRequest.prependOnceListener(event, callback);
    };

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
    //#endregion
}
