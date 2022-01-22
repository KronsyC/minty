import { BaseRequest, BaseResponse, GenericServer, Listener, ServerOptions } from './types';
import { createServer as createHttp1Server } from 'http';
import { createSecureServer as createSecureHttp2Server } from 'http2';
import { createServer as createHttpsServer } from 'https';
import listen from './listenHelper';
import Request from './Request';
import Response from './Response';

// TODO: Create an interface for this class
export default class Server {
    public baseServer: GenericServer;
    public listener?: Listener;
    private secure: boolean;

    constructor(options: ServerOptions = {}, listener?: Listener) {
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
                const serverParams = {
                    ...opts,
                    ...options.https,
                    allowHTTP1: true
                };
                this.baseServer = createSecureHttp2Server(<any>serverParams, (req, res) =>
                    this.requestHandler(req, res)
                );
            } else {
                // Create an exclusively https server
                const serverParams = {
                    ...options.https,
                    maxHeaderSize: options.maxHeaderSize,
                    insecureHTTPParser: options.insecureHttpParser
                };
                this.baseServer = createHttpsServer(<any>serverParams, (req, res) =>
                    this.requestHandler(req, res)
                );
            }
        } else {
            // Default to Http/1.1 Server
            // Cant use Http/2 insecure because it always responds with octet streams
            this.secure = false;
            this.baseServer = createHttp1Server(
                {
                    maxHeaderSize: options.maxHeaderSize,
                    insecureHTTPParser: options.insecureHttpParser
                },
                (req, res) => this.requestHandler(req, res)
            );
        }
    }
    /**
     * This method is meant to transform Generic Request/Responses into the
     * minty/http counterparts, and then pass them to the listener
     */
    private requestHandler(req: BaseRequest, res: BaseResponse) {
        const request = new Request(req);
        const response = new Response(res);
        if (this.listener) {
            try {
                this.listener(request, response);
            } catch {
                response.statusCode = 500;
                response.end('Unexpected Server Error');
            }
        } else {
            response.statusCode = 500;
            response.end('Unexpected Server Error');
        }
    }

    listen(port: number, host: string, backlog: number, callback: (host: string) => void): void;
    listen(port: number, host: string, callback: (host: string) => void): void;
    listen(port: number, callback: (host: string) => void): void;
    listen(callback: (host: string) => void): void;
    listen(port: number, backlog: number, callback: (host: string) => void): void;
    listen(address: string, callback: (host: string) => void): void;
    listen(address: string, backlog: number, callback: (host: string) => void): void;
    listen(arg1: any, arg2?: any, arg3?: any, arg4?: any) {
        listen(this.baseServer, this.secure, arg1, arg2, arg3, arg4);
    }
}
