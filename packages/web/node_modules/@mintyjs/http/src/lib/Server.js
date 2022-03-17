"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const http_1 = require("http");
const http2_1 = require("http2");
const https_1 = require("https");
const listenHelper_1 = (0, tslib_1.__importDefault)(require("../util/listenHelper"));
const Request_1 = (0, tslib_1.__importDefault)(require("./Request"));
const Response_1 = (0, tslib_1.__importDefault)(require("./Response"));
class Server {
    constructor(options = {}, listener) {
        if (listener) {
            this.listener = listener;
        }
        if (options.https) {
            this.secure = true;
            // Secure Server Types
            const http2Opts = options.http2;
            if (http2Opts) {
                // Create a backwards-compatible http2 server
                const opts = typeof http2Opts === 'object' ? http2Opts : undefined;
                const serverParams = Object.assign(Object.assign(Object.assign({}, opts), options.https), { allowHTTP1: true });
                this.baseServer = (0, http2_1.createSecureServer)(serverParams, (req, res) => this.requestHandler(req, res));
            }
            else {
                // Create an exclusively https server
                const serverParams = Object.assign(Object.assign({}, options.https), { maxHeaderSize: options.maxHeaderSize, insecureHTTPParser: options.insecureHttpParser });
                this.baseServer = (0, https_1.createServer)(serverParams, (req, res) => this.requestHandler(req, res));
            }
        }
        else {
            // Default to Http/1.1 Server
            // Cant use Http/2 insecure because it always responds with octet streams
            this.secure = false;
            this.baseServer = (0, http_1.createServer)({
                maxHeaderSize: options.maxHeaderSize,
                insecureHTTPParser: options.insecureHttpParser
            }, (req, res) => this.requestHandler(req, res));
        }
    }
    /**
     * This method is meant to transform Generic Request/Responses into the
     * minty/http counterparts, and then pass them to the listener
     */
    requestHandler(req, res) {
        const request = new Request_1.default(req);
        const response = new Response_1.default(res);
        if (this.listener) {
            try {
                this.listener(request, response);
            }
            catch (_a) {
                response.statusCode = 500;
                response.end('Unexpected Server Error');
            }
        }
        else {
            response.statusCode = 500;
            response.end('Unexpected Server Error');
        }
    }
    listen(arg1, arg2, arg3, arg4) {
        (0, listenHelper_1.default)(this.baseServer, this.secure, arg1, arg2, arg3, arg4);
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map