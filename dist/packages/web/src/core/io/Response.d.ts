/// <reference types="node" />
import { Response as HTTPResponse } from '@mintyjs/http';
import Request from './Request';
import Handler from '../Handler';
import { kCreateSendCallback, kOutgoingDataCallback } from '../symbols';
interface CookieOptions {
    /**
     * A Date object representing the time of expiry
     * or
     * A unix timestamp *(ms)*
     */
    expires?: Date | number;
    /**
     * A number representing the number of seconds in the future that
     * the cookie will expire
     */
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
}
declare const kSendCallback: unique symbol;
export default class WebResponse {
    rawResponse: HTTPResponse;
    private [kSendCallback]?;
    private hasSetStatusCode;
    hasSent: boolean;
    constructor(res: HTTPResponse);
    [kCreateSendCallback](handler: Handler, req: Request): void;
    [kOutgoingDataCallback](handler: Handler<any, any, any>, req: Request): Promise<void>;
    get headers(): import("http").OutgoingHttpHeaders;
    get statusCode(): number;
    status(code: number): this;
    send(data: any): Promise<void>;
    sendFile(location: string): Promise<void>;
    redirect(url: string): Promise<void>;
    set(name: string, value: string | string[] | number): this;
    cookie(name: string, value: any, options?: CookieOptions): this;
}
export {};
