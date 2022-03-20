import { Request as HTTPRequest, RequestHeaders } from "@mintyjs/http";
import { kBody, kParams, kQuery } from "../symbols";
import { Querystring, UrlParameters } from "../types";
interface Headers extends RequestHeaders {
}
declare class Headers {
    constructor(rawHeaders: RequestHeaders);
}
export default class Request<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring> {
    readonly rawRequest: HTTPRequest;
    private [kQuery];
    private [kParams];
    private [kBody];
    readonly headers: Headers;
    constructor(req: HTTPRequest);
    get query(): QueryType;
    get params(): ParamsType;
    get body(): BodyType;
    get path(): string;
    get method(): import("@mintyjs/http").Method;
    get source(): {
        ip: string | undefined;
        port: number | undefined;
    };
    get httpVersion(): string;
}
export {};
