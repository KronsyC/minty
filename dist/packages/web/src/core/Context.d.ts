import Handler, { HandlerSchemas } from './Handler';
import { PluginCallback, PluginOptions, UrlParameters, Querystring, RouteCallback, Method } from './types';
import Nestable from 'inside-in';
import Request from './io/Request';
import Response from './io/Response';
import Schematica from 'schematica';
import { kErrorHandler, kHandlerStore, kInitializers, kInterceptors, kNotFoundHandler, kPrefix, kRouter } from './symbols';
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
declare type InterceptableRequestCallback = (req: Request, res: Response, done: Function) => void;
declare type InterceptableResponseCallback = (req: Request, res: Response, body: any, done: Function) => void;
declare type InterceptableIncomingCallback = (req: Request, res: Response, rawBody: string, done: Function) => void;
interface ContextOptions {
    parent?: Context;
    prefix?: string;
}
export default class Context extends Nestable {
    private [kRouter];
    private [kInterceptors];
    schematicaInstance: Schematica;
    private [kPrefix];
    private [kInitializers];
    private [kHandlerStore];
    private [kErrorHandler];
    private [kNotFoundHandler];
    constructor(options?: ContextOptions);
    setNotFoundHandler(options: RouteOptions, callback: RouteCallback): void;
    setNotFoundHandler(callback: RouteCallback): void;
    sendError(req: Request, res: Response, error: any): void;
    intercept(event: 'request', callback: InterceptableRequestCallback): void;
    intercept(event: 'response', callback: InterceptableResponseCallback): void;
    intercept(event: 'incoming', callback: InterceptableIncomingCallback): void;
    /**
     * Builds the Context, its routes, and it's children
     *
     * 1. Executes All Initializers (How plugins work under the hood)
     * 2. Builds all child contexts > `this.buildChildren()`
     * 3. Builds all current Handlers > `this.buildHandlers()`
     * 4. Registers all hooks > `this.registerHooks()`
     */
    protected _build(): void;
    protected executeInitializers(): void;
    protected buildChildren(): void;
    protected buildHandlers(): void;
    protected registerHooks(): void;
    addRoute<BT = any, PT = UrlParameters, QT = Querystring>(params: CreateRouteParams<BT, PT, QT>): Handler<BT, PT, QT>;
    use<OptionsType extends PluginOptions>(plugin: PluginCallback<OptionsType>, options?: OptionsType): void;
    get<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    get<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    post<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    post<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    put<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    put<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    patch<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    patch<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    delete<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    delete<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    options<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    options<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    head<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, options: RouteOptions, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
    head<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring>(path: string, callback: RouteCallback<BodyType, ParamsType, QueryType>): void;
}
export {};
