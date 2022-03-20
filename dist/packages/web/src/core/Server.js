"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const http_1 = (0, tslib_1.__importDefault)(require("@mintyjs/http"));
const Request_1 = (0, tslib_1.__importDefault)(require("./io/Request"));
const Response_1 = (0, tslib_1.__importDefault)(require("./io/Response"));
const NotFound_1 = (0, tslib_1.__importDefault)(require("./errors/NotFound"));
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const beetroute_1 = require("beetroute");
const queryParser_1 = require("../util/queryParser");
const defaults = (0, tslib_1.__importStar)(require("./defaults"));
const symbols_1 = require("./symbols");
const Context_1 = (0, tslib_1.__importDefault)(require("./Context"));
const MessageHandler_1 = (0, tslib_1.__importDefault)(require("./io/MessageHandler"));
/**
 * Events Reference
 *
 * ----- Context Events -----
 * `prePluginLoad` - Modify a context before its initializer code is run
 * `onRouteRegister` - Listen for when a route is registered and get some metadata about it
 *
 *  ----- Server Events -----
 * `onClose` -  Triggers when the server stops
 * `onReady` - Triggers when the server is listening
 *
 *
 * ------- Request / Response Modification Hooks ------------------------
 * `preParse` - Modify the raw data before the parser is run
 * `preValidation` - Modify the body before validation
 * `preSerialization` - Modify Response Data before it is stringified and sent off
 * `preHandle` - Modify the request and response objects before the handler is triggered
 *
 * --------- Request / Response Event Hooks ------------------------
 * onRequest
 */
/**
 * The Server lifecycle has 5 states
 * 1. Loading - Defining all of the routes, plugins, and hooks > ends with app.build()
 * 2. Building - The Server is loading all of the plugins, hooks, and schemas > ends automatically
 * 3  Ready - The Server is built and ready to start > ends with app.listen
 * 4. Online - The Server is running and listening for http requests > ends with app.close()
 * 5. Closed - The Server is closed
 */
/**
 *
 */
class Server extends Context_1.default {
    constructor(options = {}) {
        var _b;
        super({ prefix: options.prefix || '/' });
        this[_a] = 'loading';
        this.listen = (arg1, arg2, arg3, arg4) => {
            // Check if the server is already prepared
            // If yes, start the server,
            // Else, prepare, then start
            if (this.stage === 'loading') {
                this.build();
            }
            if (this.stage !== 'building') {
                this[symbols_1.kBaseServer].listen(arg1, arg2, arg3, arg4);
            }
            else {
                throw new Error(`Cannot listen from ${this.stage} state`);
            }
        };
        this.poweredByHeader = (_b = options.poweredByHeader) !== null && _b !== void 0 ? _b : true;
        this.serveroptions = options;
        this[symbols_1.kBaseServer] = new http_1.default({
        //TODO:Passthrough server configuration
        }, (req, res) => this.handleRequest(req, res));
        this.setNotFoundHandler({ schemas: defaults.notFoundHandlerSchemas }, defaults.notFoundHandler);
    }
    get stage() {
        return this[symbols_1.kServerState];
    }
    handleRequest(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const query = (0, queryParser_1.parseQuery)(req.url.split('?').slice(1).join('?'));
            // Request and response are partially initialized within the handler
            const request = new Request_1.default(req);
            const response = new Response_1.default(res);
            request[symbols_1.kQuery] = query;
            try {
                // Do a router lookup
                const { handler, params } = this[symbols_1.kRouter].find(req.url, req.method);
                request[symbols_1.kParams] = params;
                const messageHandler = new MessageHandler_1.default(request, response, handler);
                yield handler.handle(messageHandler);
            }
            catch (err) {
                //#region router error handler negotiation
                const contexts = this.deepGetChildren();
                contexts.unshift(this);
                const contextPaths = contexts.map(c => c[symbols_1.kPrefix]);
                const contextPathMatchWeights = contextPaths.map(p => 0);
                const contextPathBlacklist = contextPaths.map(p => false);
                const path = (0, beetroute_1.formatUrl)(req.url, true);
                // Find the index of the path that best matches the 404 path
                const segments = path.split("/");
                segments.forEach((segment, index) => {
                    contextPaths.forEach((path, ctxIndex) => {
                        const ctxSeg = path.split("/")[index];
                        if (ctxSeg === segment && !contextPathBlacklist[ctxIndex]) {
                            contextPathMatchWeights[ctxIndex]++;
                        }
                        else {
                            contextPathBlacklist[ctxIndex] = true;
                        }
                    });
                    //#endregion
                });
                // Each context path now has a weight, chose the first path with the highest weight
                let highest = this;
                contextPathMatchWeights.reduce((prev, current, index) => {
                    if (prev >= current) {
                        return prev;
                    }
                    else {
                        highest = contexts[index];
                        return current;
                    }
                });
                switch (err.name) {
                    case "ERR_NOT_FOUND":
                        const messageHandler = new MessageHandler_1.default(request, response, highest[symbols_1.kNotFoundHandler]);
                        yield highest[symbols_1.kNotFoundHandler].handle(messageHandler);
                        break;
                }
            }
        });
    }
    build() {
        if (this[symbols_1.kServerState] === 'loading') {
            this[symbols_1.kServerState] = 'building';
            this._build();
            this[symbols_1.kServerState] = 'ready';
        }
        else {
            throw new Error('Can only build from the loading state');
        }
    }
    static(location, options = {}) {
        var _b, _c;
        const prefix = (0, beetroute_1.formatUrl)(options.prefix || '', true);
        const defaultExtension = (_b = options.defaultExtension) !== null && _b !== void 0 ? _b : ".html";
        const rootFile = (_c = options.rootFile) !== null && _c !== void 0 ? _c : "index.html";
        this.get(`${prefix}/**`, (req, res) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let requestPath = (0, beetroute_1.formatUrl)(req.params['*'] || '/', true);
            requestPath = requestPath.slice(prefix.length);
            if (!requestPath)
                requestPath = rootFile;
            const segments = requestPath.split('/');
            // Default extension is .html
            const lastSegment = segments[segments.length - 1];
            if (!lastSegment.includes('.')) {
                segments[segments.length - 1] += defaultExtension;
            }
            const filePath = path_1.default.join(location, ...segments);
            if (!filePath.startsWith(location)) {
                throw new NotFound_1.default();
            }
            else {
                // Default Headers
                if (options.defaultHeaders) {
                    for (let header in options.defaultHeaders) {
                        res.set(header, options.defaultHeaders[header]);
                    }
                }
                res.sendFile(filePath);
            }
        }));
    }
}
exports.default = Server;
_a = symbols_1.kServerState;
//# sourceMappingURL=Server.js.map