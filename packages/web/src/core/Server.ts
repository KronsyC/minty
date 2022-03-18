import HttpServer, { Request as HTTPRequest, Response as HTTPResponse } from '@mintyjs/http';
import Request from './io/Request';
import Response, { kCreateSendCallback } from './io/Response';
import NotFound from './errors/NotFound';
import path from 'path';
import { formatUrl } from "beetroute"
import { parseQuery } from '../util/queryParser';
import * as defaults from "./defaults"
import { ListenMethod, ServerLifecycleStage } from './types';
import { kBaseServer, kNotFoundHandler, kParams, kPrefix, kQuery, kRouter, kServerState } from './symbols';
import Context from './Context';

interface ServeStaticDirectoryOptions {
    prefix?: string;
    index?: string;
    defaultHeaders?: { [x: string]: string };
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
interface WildcardParams {
    '*': string;
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

    private [kServerState]: ServerLifecycleStage = 'loading';
    private serveroptions: ServerOptions;
    private poweredByHeader: boolean;
    constructor(options: ServerOptions = {}) {
        super({ prefix: options.prefix || '/' });
        this.poweredByHeader = options.poweredByHeader ?? true;
        this.serveroptions = options;
        this[kBaseServer] = new HttpServer(
            {
                //TODO:Passthrough server configuration
            },
            (req, res) => this.handleRequest(req, res)
        );

        this.setNotFoundHandler({ schemas: defaults.notFoundHandlerSchemas }, defaults.notFoundHandler);

    }
    public get stage() {
        return this[kServerState];
    }
    private async handleRequest(req: HTTPRequest, res: HTTPResponse) {
        const query = parseQuery(req.url.split('?').slice(1).join('?'));
        // Request and response are partially initialized within the handler
        const request = new Request(req);
        const response = new Response(res, request);


        request[kQuery] = query;
        try {
            this.poweredByHeader ? res.setHeader('X-Powered-By', 'MintWeb') : null;
            res.setHeader('X-Content-Type-Options', 'nosniff');

            // Do a router lookup
            const { handler, params } = this[kRouter].find(req.url, req.method);
            request[kParams] = params;

            await handler.handle(request, response);
        } catch (err: any) {
          //#region router error handler negotiation
          const contexts = this.deepGetChildren()
          contexts.unshift(this)
          const contextPaths = contexts.map(c=>c[kPrefix])
          const contextPathMatchWeights = contextPaths.map(p=>0)
          const contextPathBlacklist = contextPaths.map(p=>false)
          const path = formatUrl(req.url, true)
          
          // Find the index of the path that best matches the 404 path
          const segments = path.split("/")

          segments.forEach( (segment, index) => {
            contextPaths.forEach( (path, ctxIndex) => {
              const ctxSeg = path.split("/")[index]
              if(ctxSeg === segment && !contextPathBlacklist[ctxIndex]){
                contextPathMatchWeights[ctxIndex]++
              }
              else{
                contextPathBlacklist[ctxIndex] = true
              }
            } )
          } )

          // Each context path now has a weight, chose the first path with the highest weight
          let highest:Context = this;
          contextPathMatchWeights.reduce( (prev, current, index) => {
            if(prev>=current){
              return prev
            }
            else{
              highest=contexts[index]
              return current
            }
          } )
          
          switch(err.name){
            case "ERR_NOT_FOUND":
                
                await highest[kNotFoundHandler].handle(request, response)
                break;
          }          
        }
    }
    public build() {
        if (this[kServerState] === 'loading') {
            this[kServerState] = 'building';

            this._build();

            this[kServerState] = 'ready';
        } else {
            throw new Error('Can only build from the loading state');
        }
    }
    public listen: ListenMethod = (arg1: any, arg2?: any, arg3?: any, arg4?: any) => {
        // Check if the server is already prepared
        // If yes, start the server,
        // Else, prepare, then start
        if (this.stage === 'loading') {
            this.build();
        }
        if (this.stage !== 'building') {
            this[kBaseServer].listen(arg1, arg2, arg3, arg4);
        } else {
            throw new Error(`Cannot listen from ${this.stage} state`);
        }
    };

    public static(location: string, options: ServeStaticDirectoryOptions = {}) {
        const prefix = formatUrl(options.prefix || '', false);

        this.get<any, WildcardParams>(`${prefix ? prefix + '/' : ''}**`, async (req, res) => {
            let requestPath: string = formatUrl(req.params['*'] || '/', true);

            requestPath = requestPath.slice(prefix.length);
            if (!requestPath) requestPath = 'index.html';

            const segments = requestPath.split('/');

            // Default extension is .html
            const lastSegment = segments[segments.length - 1];

            if (!lastSegment.includes('.')) {
                segments[segments.length - 1] += '.html';
            }
            const filePath = path.join(location, ...segments);

            if (!filePath.startsWith(location)) {
                this.sendError(req, res, new NotFound(`Could not ${req.method} ${req.path}`));
            } else {
                // Default Headers
                if (options.defaultHeaders) {
                    for (let header in options.defaultHeaders) {
                        res.set(header, options.defaultHeaders[header]);
                    }
                }

                res.sendFile(filePath);
            }
        });
    }
}
