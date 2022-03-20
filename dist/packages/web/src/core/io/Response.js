"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fs_1 = (0, tslib_1.__importDefault)(require("node:fs"));
const mime_types_1 = (0, tslib_1.__importDefault)(require("mime-types"));
const symbols_1 = require("../symbols");
const kSendCallback = Symbol('Send Callback');
class WebResponse {
    constructor(res) {
        this.hasSetStatusCode = false;
        this.hasSent = false;
        this.rawResponse = res;
    }
    [symbols_1.kCreateSendCallback](handler, req) {
        let sendAttempts = 0;
        const context = handler['context'];
        this[kSendCallback] = (data) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield this[symbols_1.kOutgoingDataCallback](handler, req);
            if (sendAttempts > 10) {
                // Poorly WritteError Handling can lead to infinite call stack, this is protection
                this.status(500);
                this.rawResponse.end('Server was unable to fulfil the request');
                return;
            }
            try {
                const [serialized, mimeType] = handler.serializeResponse(data, this);
                if (!this.headers['content-type']) {
                    this.set('content-type', mimeType);
                }
                this.rawResponse.end(serialized);
                this.hasSent = true;
            }
            catch (err) {
                sendAttempts++;
                context.sendError(req, this, err);
            }
        });
    }
    [symbols_1.kOutgoingDataCallback](handler, req) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield handler.executeResponseInterceptors(req, this);
        });
    }
    get headers() {
        return this.rawResponse.getHeaders();
    }
    get statusCode() {
        return this.rawResponse.statusCode;
    }
    status(code) {
        this.hasSetStatusCode = true;
        this.rawResponse.statusCode = code;
        return this;
    }
    send(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this[kSendCallback]) {
                if (!this.hasSent) {
                    //@ts-expect-error
                    this[kSendCallback](data);
                }
            }
            else {
                throw new Error('No Send callback found, please open a github issue');
            }
        });
    }
    sendFile(location) {
        return new Promise((resolve, reject) => {
            node_fs_1.default.readFile(location, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                const mimeType = mime_types_1.default.contentType(location);
                if (mimeType) {
                    this.set('content-type', mimeType);
                    this.set('content-length', data.buffer.byteLength);
                    this.rawResponse.end(data);
                    resolve(true);
                }
                else {
                    reject(new Error(`Could not get valid mime type for file ${location}`));
                }
            });
        });
    }
    notFound() {
        // Force a 404 response
        //@ts-expect-error
        const messageHandler = this[symbols_1.kMessageHandler];
        messageHandler.context[symbols_1.kNotFoundHandler].handle(messageHandler);
    }
    redirect(url) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!this.hasSetStatusCode) {
                this.status(307);
            }
            this.set('location', url);
            this.send(`Redirecting to ${url}`);
        });
    }
    set(name, value) {
        this.rawResponse.setHeader(name, value);
        return this;
    }
    cookie(name, value, options) {
        let optionsString = '';
        function add(propname, value) {
            if (value) {
                optionsString += `${propname}=${value};`;
            }
            else {
                optionsString += `${propname};`;
            }
        }
        if (options) {
            if (options.domain)
                add('Domain', options.domain);
            if (options.httpOnly)
                add('HttpOnly');
            if (options.path)
                add('Path', options.path);
            if (options.secure)
                add('Secure');
            if (options.sameSite)
                add('SameSite', options.sameSite);
            if (options.maxAge) {
                // Override the expires value
                // expires provides better backwards compatability than
                // Max-Age
                const now = new Date();
                const expiry = new Date(0);
                expiry.setUTCMilliseconds(now.getTime() + Math.round(options.maxAge * 1000));
                options.expires = expiry;
            }
            if (options.expires) {
                if (options.expires instanceof Date) {
                    add('Expires', options.expires.toUTCString());
                }
                else {
                    const epochTime = new Date();
                    const seconds = Math.floor(options.expires / 1000);
                    const milliseconds = options.expires % 1000;
                    epochTime.setUTCSeconds(seconds, milliseconds);
                    add('Expires', epochTime.toUTCString());
                }
            }
        }
        this.set('set-cookie', `${name}=${value};${optionsString}`);
        return this;
    }
}
exports.default = WebResponse;
//# sourceMappingURL=Response.js.map