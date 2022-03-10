import Router from '@mintyjs/router';
import { RouteCallback } from '../lib/types';
import Handler, { HandlerSchemas } from './Handler';
import { Method } from '@mintyjs/http';
import SchemaProvider from './SchemaProvider';
import { PluginCallback, PluginOptions, UrlParameters, Querystring } from './types';
import fmtUrl from '@mintyjs/fmturl';
import ContextHookManager, { OnPluginLoadListener, OnRouteRegisterListener, RegisterContextHookMethod, RouteMetadata } from './ContextHookManager';
import Nestable, { Inherited, FromRoot } from 'inside-in';
interface RouteOptions {
    schemas?: HandlerSchemas;
}
interface CreateRouteParams<BodyType, ParamsType, QueryType> {
    method: Method;
    path: string;
    handler: RouteCallback<BodyType, ParamsType, QueryType>;
    schemas?: HandlerSchemas;
}

/**
 *
 * @param context The Current context
 *
 * Searches up the context tree until a context without a parent is found
 */

const kPrefix = Symbol('Context Route Prefix');
export const kRouter = Symbol('Router');

export const kSchemaProvider = Symbol('Schema Provider');
export const kErrorSerializer = Symbol('Error Serializer');
const kContextHookManager = Symbol('Context Hook Manager');
const kHandlerStore = Symbol('Route Store');
const kInitializers = Symbol('Initializer Function');

export const kOnPluginLoadHandlers = Symbol('On Plugin Load Handlers');
export const kOnRouteRegisterHandlers = Symbol('On Route Register Handlers');

interface ContextOptions {
    parent?: Context;
    prefix?: string;
}
export default class Context extends Nestable {
    @FromRoot() // Try To load from root before instantiating a new router
    private [kRouter]: Router<Handler>;
    private [kSchemaProvider]: SchemaProvider;
    private [kErrorSerializer]: Function;
    private [kPrefix]: string;
    private [kInitializers]: Function[] = [];
    private [kHandlerStore]: Handler<any, any, any>[] = [];
    private [kContextHookManager]: ContextHookManager;
    private [kOnPluginLoadHandlers]: OnPluginLoadListener[] = [];
    private [kOnRouteRegisterHandlers]: OnRouteRegisterListener[] = [];
    constructor(options: ContextOptions = {}) {
        super();
        options.parent?.addChild(this);
        this[kOnRouteRegisterHandlers] = [...(options.parent?.[kOnRouteRegisterHandlers] ?? [])];
        this[kPrefix] = fmtUrl(options.prefix ?? this.getParent()?.[kPrefix] ?? '/', true);
        this[kContextHookManager] = new ContextHookManager({ context: this });
        this[kRouter] = new Router({});
        this[kSchemaProvider] = new SchemaProvider();
        const schema = this[kSchemaProvider].createSchema({
            type: 'object',
            required: ['statusCode', 'error'],
            properties: {
                statusCode: {
                    type: 'number',
                    min: 100,
                    max: 599,
                },
                error: 'string',
                message: 'string',
            },
            strict: true,
        });
        this[kErrorSerializer] = this[kSchemaProvider].buildSerializer(schema);
    }

    public on: RegisterContextHookMethod = (event, listener) => {
        //@ts-expect-error
        this[kContextHookManager].register(event, listener);
    };

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
        const metadata: RouteMetadata = {
            path: route,
            method: params.method,
            schemas: params.schemas || {},
            context: this,
        };
        const hooks = this[kOnRouteRegisterHandlers];
        let currentIndex = 0;
        const nextHandler = () => {
            const next = hooks[currentIndex];
            if (next) {
                currentIndex++;
                next(metadata, nextHandler);
            } else {
                return;
            }
        };
        nextHandler();

        this[kHandlerStore].push(
            new Handler({
                listener: params.handler,
                context: this,
                schemas: params.schemas || {},
                path: route,
                method: params.method,
            })
        );
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
