import Context from '../core/Context';
import WebRequest from '../core/Request';
import WebResponse from '../core/Response';
import { Querystring, UrlParameters } from '../core/types';

export type RouteCallback<BodyType = any, ParamsType=UrlParameters, QueryType=Querystring> = (
    this: Context,
    req: WebRequest<BodyType, ParamsType, QueryType>,
    res: WebResponse
) => Promise<any>;

export type Serializer = (doc: any) => any;

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


