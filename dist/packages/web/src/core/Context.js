"use strict";
var _a, _b;
var _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Handler_1 = (0, tslib_1.__importDefault)(require("./Handler"));
const inside_in_1 = (0, tslib_1.__importStar)(require("inside-in"));
const beetroute_1 = (0, tslib_1.__importStar)(require("beetroute"));
const schematica_1 = (0, tslib_1.__importDefault)(require("schematica"));
const defaults = (0, tslib_1.__importStar)(require("./defaults"));
const symbols_1 = require("./symbols");
class Context extends inside_in_1.default {
    constructor(options = {}) {
        var _f, _g, _h, _j;
        super();
        this[_d] = {
            request: [],
            response: [],
            incoming: [],
        };
        this[_a] = [];
        this[_b] = [];
        (_f = options.parent) === null || _f === void 0 ? void 0 : _f.addChild(this);
        this[symbols_1.kPrefix] = (0, beetroute_1.formatUrl)((_j = (_g = options.prefix) !== null && _g !== void 0 ? _g : (_h = this.getParent()) === null || _h === void 0 ? void 0 : _h[symbols_1.kPrefix]) !== null && _j !== void 0 ? _j : '/', true);
        this[symbols_1.kRouter] = new beetroute_1.default({});
        this.schematicaInstance = new schematica_1.default();
        // Defaults
        this[symbols_1.kErrorHandler] = defaults.errorHandler;
    }
    setNotFoundHandler(arg1, arg2) {
        let handler;
        if (typeof arg1 === 'function') {
            handler = this.addRoute({
                method: 'ALL',
                path: '404',
                handler: arg1,
                schemas: {},
                addToRouter: false,
            });
        }
        else {
            handler = this.addRoute({
                method: 'ALL',
                path: '404',
                //@ts-expect-error
                handler: arg2,
                schemas: arg1.schemas,
                addToRouter: false,
            });
        }
        this[symbols_1.kNotFoundHandler] = handler;
    }
    sendError(req, res, error) {
        this[symbols_1.kErrorHandler](req, res, error, this);
    }
    intercept(event, callback) {
        switch (event) {
            case 'request':
                this[symbols_1.kInterceptors].request.push(callback);
                break;
            case 'response':
                this[symbols_1.kInterceptors].response.push(callback);
                break;
            case 'incoming':
                this[symbols_1.kInterceptors].incoming.push(callback);
                break;
            default:
                throw new Error(`No Interceptable Event ${event}`);
        }
    }
    /**
     * Builds the Context, its routes, and it's children
     *
     * 1. Executes All Initializers (How plugins work under the hood)
     * 2. Builds all child contexts > `this.buildChildren()`
     * 3. Builds all current Handlers > `this.buildHandlers()`
     * 4. Registers all hooks > `this.registerHooks()`
     */
    _build() {
        this.executeInitializers();
        this.buildChildren();
        this.buildHandlers();
    }
    //#region builder methods
    executeInitializers() {
        this[symbols_1.kInitializers].forEach((initializer) => {
            // Initializers take in one params which is the Context
            initializer(this);
        });
    }
    buildChildren() {
        this.getChildren().forEach((child) => {
            child._build();
        });
    }
    buildHandlers() {
        this[symbols_1.kHandlerStore].forEach((handler) => {
            handler.build();
            if (!handler.addToRouter)
                return;
            this[symbols_1.kRouter].addRoute(handler.path, handler.method, handler);
        });
    }
    registerHooks() { }
    //#endregion
    addRoute(params) {
        let route;
        if (params.path === '*') {
            route = '*';
        }
        else {
            route = this[symbols_1.kPrefix] + '/' + (0, beetroute_1.formatUrl)(params.path, true);
        }
        const handler = new Handler_1.default({
            listener: params.handler,
            context: this,
            schemas: params.schemas || {},
            path: route,
            method: params.method,
            addToRouter: params.addToRouter,
        });
        this[symbols_1.kHandlerStore].push(handler);
        return handler;
    }
    use(plugin, options) {
        const opts = (options || {});
        const rawPrefix = opts.prefix || this[symbols_1.kPrefix];
        // The Prefix to register the plugin under, defaults to parent's prefix
        const pluginPrefix = (0, beetroute_1.formatUrl)(rawPrefix || this[symbols_1.kPrefix], true);
        // const absolutePrefix = this[kPrefix] + '/' + pluginPrefix;
        function doneFunction() { }
        function addIntializer(store) {
            store.push((cwc) => {
                const _plugin = plugin.bind(cwc);
                _plugin(cwc, opts, doneFunction);
            });
        }
        if (plugin.global) {
            const root = this.getRootNode();
            addIntializer(root[symbols_1.kInitializers]);
        }
        else {
            const child = new Context({ parent: this, prefix: pluginPrefix });
            addIntializer(child[symbols_1.kInitializers]);
        }
    }
    get(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'GET',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'GET',
                path: path,
                handler: arg2,
            });
        }
    }
    post(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'POST',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'POST',
                path: path,
                handler: arg2,
            });
        }
    }
    put(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'PUT',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'PUT',
                path: path,
                handler: arg2,
            });
        }
    }
    patch(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'PATCH',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'PATCH',
                path: path,
                handler: arg2,
            });
        }
    }
    delete(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'DELETE',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'DELETE',
                path: path,
                handler: arg2,
            });
        }
    }
    options(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'OPTIONS',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'OPTIONS',
                path: path,
                handler: arg2,
            });
        }
    }
    head(path, arg2, arg3) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'HEAD',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        }
        else {
            this.addRoute({
                method: 'HEAD',
                path: path,
                handler: arg2,
            });
        }
    }
}
_c = symbols_1.kRouter, _d = symbols_1.kInterceptors, _a = symbols_1.kInitializers, _b = symbols_1.kHandlerStore, _e = symbols_1.kNotFoundHandler;
(0, tslib_1.__decorate)([
    (0, inside_in_1.FromRoot)() // Try To load from root before instantiating a new router
    ,
    (0, tslib_1.__metadata)("design:type", beetroute_1.default)
], Context.prototype, _c, void 0);
(0, tslib_1.__decorate)([
    (0, inside_in_1.Inherited)(true, true),
    (0, tslib_1.__metadata)("design:type", Object)
], Context.prototype, _d, void 0);
(0, tslib_1.__decorate)([
    (0, inside_in_1.FromRoot)(),
    (0, tslib_1.__metadata)("design:type", Object)
], Context.prototype, "schematicaInstance", void 0);
(0, tslib_1.__decorate)([
    (0, inside_in_1.DefaultToParent)(),
    (0, tslib_1.__metadata)("design:type", Handler_1.default)
], Context.prototype, _e, void 0);
exports.default = Context;
//# sourceMappingURL=Context.js.map