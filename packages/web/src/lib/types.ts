import Context from '../core/Context';
import WebRequest from '../core/Request';
import WebResponse from '../core/Response';

export type RouteCallback = (
    this: Context,
    req: WebRequest,
    res: WebResponse
) => Promise<any>;

export type Serializer = (doc: any) => any;

export type HookEvent = 'onRequest' | 'onResponse';

export type ListenMethod = {
    (
        port: number,
        host: string,
        backlog: number,
        callback: (host: string) => void
    ): void;
    (port: number, host: string, callback: (host: string) => void): void;
    (port: number, backlog: number, callback: (host: string) => void): void;
    (port: number, callback: (host: string) => void): void;
    (port: number): void;
    (address: string, backlog: number, callback: (host: string) => void): void;
    (address: string, callback: (host: string) => void): void;
    (address: string): void;
};

export interface PluginOptions {}
export type PluginCallback = (app: Context, options: PluginOptions) => void;


