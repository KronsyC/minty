import Context from "./Context";
import Request from "./io/Request";
import Response from "./io/Response";
import { Method as HTTPMethod } from "@mintyjs/http";
/**
 * A Query is defined as an object which can contain other Querystrings, i.e user[id]=123 etc.
 */
export interface Querystring {
    [x: string]: any | Querystring;
}
export interface UrlParameters {
    [x: string]: any;
}
export interface PluginOptions {
    prefix?: string;
    logLevel?: number;
}
export declare type PluginCallback<ConfigType extends PluginOptions = PluginOptions> = {
    (app: Context, options: ConfigType, done: any): void;
    global?: boolean;
};
export declare type ServerLifecycleStage = "loading" | "building" | "ready" | "online" | "closed";
export declare type RouteCallback<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring> = (this: Context, req: Request<BodyType, ParamsType, QueryType>, res: Response) => Promise<any>;
export declare type Serializer = (doc: any) => any;
export declare type ListenMethod = {
    (port: number, host: string, backlog: number, callback: (host: string) => void): void;
    (port: number, host: string, callback: (host: string) => void): void;
    (port: number, backlog: number, callback: (host: string) => void): void;
    (port: number, callback: (host: string) => void): void;
    (port: number): void;
    (address: string, backlog: number, callback: (host: string) => void): void;
    (address: string, callback: (host: string) => void): void;
    (address: string): void;
};
export interface PluginOptions {
}
export declare type Method = HTTPMethod | "ALL";
