import Handler, { HandlerSchemas } from './Handler';

import { PluginCallback, PluginOptions, UrlParameters, Querystring, RouteCallback, Method } from './types';
import Nestable, { FromRoot, Inherited } from 'inside-in';
import Request from './io/Request';
import Response from './io/Response';
import Schematica from 'schematica';
import * as defaults from './defaults';
interface RouteOptions {
    schemas?: HandlerSchemas;
}
interface CreateRouteParams<BodyType, ParamsType, QueryType> {
    method: Method;
    path: string;
    handler: RouteCallback<BodyType, ParamsType, QueryType>;
    schemas?: HandlerSchemas;
    addToRouter?: boolean;
}

interface ContextInterceptors {
    request: InterceptableRequestCallback[];
    response: InterceptableResponseCallback[];
    incoming: InterceptableIncomingCallback[];
}

type InterceptableRequestCallback = (req: Request, res: Response, done: Function) => void;
type InterceptableResponseCallback = (req: Request, res: Response, body: any, done: Function) => void;
type InterceptableIncomingCallback = (req: Request, res: Response, rawBody: string, done: Function) => void;

type ErrorHandlerFn = (req: Request, res: Response, error: any, context: Context) => void;
type NotFoundHandlerFn = (req: Request, res: Response) => void;
interface ContextOptions {
    parent?: Context;
    prefix?: string;
}
const kHandlerStore = Symbol('Route Store');
const kInitializers = Symbol('Initializer Function');
export const kPrefix = Symbol('Context Route Prefix');
export const kRouter = Symbol('Router');
export const kOnPluginLoadHandlers = Symbol('On Plugin Load Handlers');
export const kOnRouteRegisterHandlers = Symbol('On Route Register Handlers');
export const kInterceptors = Symbol('Interceptors');
const kErrorHandler = Symbol('Error Handler');
export const kNotFoundHandler = Symbol('Not Found Handler');
export default class Context extends Nestable {
    @FromRoot() // Try To load from root before instantiating a new router
    private [kRouter]: Router<Handler>;

    @Inherited(true, true)
    private [kInterceptors]: ContextInterceptors = {
        request: [],
        response: [],
        incoming: [],
    };

    @FromRoot()
    public schematicaInstance;

    private [kPrefix]: string;
    private [kInitializers]: Function[] = [];
    private [kHandlerStore]: Handler<any, any, any>[] = [];

    private [kErrorHandler]: ErrorHandlerFn;
    @DefaultToParent()
    private [kNotFoundHandler]: Handler;
    constructor(options: ContextOptions = {}) {
        super();
        options.parent?.addChild(this);
        this[kPrefix] = fmtUrl(options.prefix ?? this.getParent()?.[kPrefix] ?? '/', true);
        this[kRouter] = new Router({});
        this.schematicaInstance = new Schematica();

        // Defaults
        this[kErrorHandler] = defaults.errorHandler;

        
    }
    setNotFoundHandler(options: RouteOptions, callback: RouteCallback): void;
    setNotFoundHandler(callback: RouteCallback): void;
    setNotFoundHandler(arg1: RouteOptions | RouteCallback, arg2?: RouteCallback): void {
        let handler;
        if (typeof arg1 === 'function') {
            handler = this.addRoute({
                method: 'ALL',
                path: '404',
                handler: arg1,
                schemas: {},
                addToRouter: false,
            });
        } else {
            handler = this.addRoute({
                method: 'ALL',
                path: '404',
                //@ts-expect-error
                handler: arg2,
                schemas: arg1.schemas,
                addToRouter: false,
            });
        }
        this[kNotFoundHandler] = handler;
    }

    sendError(req: Request, res: Response, error: any) {
        this[kErrorHandler](req, res, error, this);
    }

    intercept(event: 'request', callback: InterceptableRequestCallback): void;
    intercept(event: 'response', callback: InterceptableResponseCallback): void;
    intercept(event: 'incoming', callback: InterceptableIncomingCallback): void;
    intercept(event: 'request' | 'response' | 'incoming', callback: any) {
        switch (event) {
            case 'request':
                this[kInterceptors].request.push(callback);
                break;
            case 'response':
                this[kInterceptors].response.push(callback);
                break;
            case 'incoming':
                this[kInterceptors].incoming.push(callback);
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
    protected _build() {
        this.executeInitializers();
        this.buildChildren();
        this.buildHandlers();
    }
    //#region builder methods
    protected executeInitializers() {
        this[kInitializers].forEach((initializer) => {
            // Initializers take in one params which is the Context
            initializer(this);
        });
    }
    protected buildChildren() {
        this.getChildren().forEach((child) => {
            child._build();
        });
    }
    protected buildHandlers() {
        this[kHandlerStore].forEach((handler) => {
            handler.build();
            if (!handler.addToRouter) return;
            this[kRouter].addRoute(handler.path, handler.method, handler);
        });
    }
    protected registerHooks() {}
    //#endregion

    public addRoute<BT = any, PT = UrlParameters, QT = Querystring>(params: CreateRouteParams<BT, PT, QT>) {
        let route: string;
        if (params.path === '*') {
            route = '*';
        } else {
            route = this[kPrefix] + '/' + fmtUrl(params.path, true);
        }
        const handler = new Handler({
            listener: params.handler,
            context: this,
            schemas: params.schemas || {},
            path: route,
            method: params.method,
            addToRouter: params.addToRouter,
        });
        this[kHandlerStore].push(handler);
        return handler;
    }
    public use<OptionsType extends PluginOptions>(plugin: PluginCallback<OptionsType>, options?: OptionsType): void {
        const opts = <OptionsType>(options || {});
        const rawPrefix = opts.prefix || this[kPrefix];

        // The Prefix to register the plugin under, defaults to parent's prefix
        const pluginPrefix = fmtUrl(rawPrefix || this[kPrefix], true);
        // const absolutePrefix = this[kPrefix] + '/' + pluginPrefix;

        function doneFunction() {}
        function addIntializer(store: Function[]) {
            store.push((cwc: Context) => {
                const _plugin = plugin.bind(cwc);
                _plugin(cwc, opts, doneFunction);
            });
        }
        if (plugin.global) {
            const root = this.getRootNode();
            addIntializer(root[kInitializers]);
        } else {
            const child = new Context({ parent: this, prefix: pluginPrefix });
            addIntializer(child[kInitializers]);
        }
    }

    //#region router method abstractions
    get<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    get<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    get<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback): void {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'GET',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'GET',
                path: path,
                handler: <any>arg2,
            });
        }
    }

    post<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    post<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    post<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'POST',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'POST',
                path: path,
                handler: <any>arg2,
            });
        }
    }
    put<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    put<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    put<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'PUT',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'PUT',
                path: path,
                handler: <any>arg2,
            });
        }
    }

    patch<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    patch<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    patch<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'PATCH',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'PATCH',
                path: path,
                handler: <any>arg2,
            });
        }
    }
    delete<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(
        path: string,
        options: RouteOptions,
        callback: RouteCallback<BodyType, ParamsType, QueryType>
    ): void;
    delete<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    delete<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'DELETE',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'DELETE',
                path: path,
                handler: <any>arg2,
            });
        }
    }
    options<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(
        path: string,
        options: RouteOptions,
        callback: RouteCallback<BodyType, ParamsType, QueryType>
    ): void;
    options<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    options<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'OPTIONS',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'OPTIONS',
                path: path,
                handler: <any>arg2,
            });
        }
    }

    head<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    head<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    head<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, arg2: RouteOptions | RouteCallback, arg3?: RouteCallback) {
        if (typeof arg3 === 'function' && typeof arg2 === 'object') {
            this.addRoute({
                method: 'HEAD',
                path: path,
                handler: arg3,
                schemas: arg2.schemas,
            });
        } else {
            this.addRoute({
                method: 'HEAD',
                path: path,
                handler: <any>arg2,
            });
        }
    }
    //#endregion
}
