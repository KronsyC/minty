import HttpServer from '@mintyjs/http';
import { ListenMethod, ServerLifecycleStage } from './types';
import { kBaseServer, kServerState } from './symbols';
import Context from './Context';
interface ServeStaticDirectoryOptions {
    prefix?: string;
    index?: string;
    defaultHeaders?: {
        [x: string]: string;
    };
    defaultExtension?: string;
    rootFile?: string;
}
declare module '@mintyjs/http' {
    interface Request {
        params: {
            [x: string]: any;
        };
        query: {
            [x: string]: any;
        };
    }
}
interface ServerOptions {
    poweredByHeader?: boolean;
    prefix?: string;
}
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
export default class Server extends Context {
    [kBaseServer]: HttpServer;
    private [kServerState];
    private serveroptions;
    private poweredByHeader;
    constructor(options?: ServerOptions);
    get stage(): ServerLifecycleStage;
    private handleRequest;
    build(): void;
    listen: ListenMethod;
    static(location: string, options?: ServeStaticDirectoryOptions): void;
}
export {};
