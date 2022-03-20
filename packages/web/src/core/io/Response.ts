import fs from 'node:fs';
import mimeTypes from 'mime-types';
import { Response as HTTPResponse } from '@mintyjs/http';
import Request from './Request';
import Handler from '../Handler';
import NotFound from '../errors/NotFound';
import { kCreateSendCallback, kMessageHandler, kOutgoingDataCallback } from '../symbols';
import MessageHandler from './MessageHandler';

interface CookieOptions{
    /**
     * A Date object representing the time of expiry   
     * or   
     * A unix timestamp *(ms)*
     */
    expires?:Date|number;
    /**
     * A number representing the number of seconds in the future that
     * the cookie will expire
     */
    maxAge?:number;
    domain?:string;
    path?:string;
    secure?:boolean;
    httpOnly?:boolean;
    sameSite?:"strict"|"lax"|"none"
}

const kSendCallback = Symbol('Send Callback');
export default class WebResponse {
    rawResponse: HTTPResponse;
    private [kSendCallback]?: (data: any) => void;

    private hasSetStatusCode: boolean = false;
    public hasSent: boolean = false;
    constructor(res: HTTPResponse) {
        this.rawResponse = res;
    }
    [kCreateSendCallback](handler: Handler, req: Request) {
        let sendAttempts = 0;
        const context = handler['context'];
        this[kSendCallback] = async (data: any) => {
            await this[kOutgoingDataCallback](handler, req);
            if (sendAttempts > 10) {
                // Poorly WritteError Handling can lead to infinite call stack, this is protection
                this.status(500);
                this.rawResponse.end('Server was unable to fulfil the request');
                return;
            }

            try {
                const [serialized, mimeType] = handler.serializeResponse(data, this);

                if (!this.headers['content-type']) {
                    this.set('content-type', mimeType);
                }

                this.rawResponse.end(serialized);
                this.hasSent = true;
            } catch (err) {
                sendAttempts++;
                context.sendError(req, this, err);
            }
        };
    }
    async [kOutgoingDataCallback](handler: Handler<any, any, any>, req: Request) {
        await handler.executeResponseInterceptors(req, this);
    }
    get headers() {
        return this.rawResponse.getHeaders();
    }
    get statusCode() {
        return this.rawResponse.statusCode;
    }
    status(code: number) {
        this.hasSetStatusCode = true;
        this.rawResponse.statusCode = code;
        return this;
    }

    async send(data: any) {
        if (this[kSendCallback]) {
            if (!this.hasSent) {
                //@ts-expect-error
                this[kSendCallback](data);
            }
        } else {
            throw new Error('No Send callback found, please open a github issue');
        }
    }
    async sendFile(location: string) {
        // @ts-expect-error MessageHandler is injected, Typescript doesn't like this 
        const messageHandler:MessageHandler = this[kMessageHandler]

        const context = messageHandler.context
        const req = messageHandler.request
        
        fs.readFile(location, (err, data) => {
            if (err) {
                context.sendError(req, this, new NotFound(`File ${req.path} not found`));
                return;
            }
            const mimeType = mimeTypes.contentType(location);

            if (mimeType) {
                this.set('content-type', mimeType);
                this.set('content-length', data.buffer.byteLength);
                this.rawResponse.end(data);
            } else {
                context.sendError(req, this, new Error(`Could not get valid mime type for ${location}`));
            }
        });
    }
    async redirect(url: string) {
        if (!this.hasSetStatusCode) {
            this.status(307);
        }
        this.set('location', url);
        this.send(`Redirecting to ${url}`);
    }
    set(name: string, value: string | string[] | number) {
        this.rawResponse.setHeader(name, value);
        return this;
    }

    cookie(name:string, value:any, options?:CookieOptions){
        let optionsString=""
        function add(propname:string, value?:string){
            if(value){
                optionsString+=`${propname}=${value};`
            }
            else{
                optionsString+=`${propname};`
            }
        }
        if(options){
            if(options.domain)add("Domain", options.domain)
            if(options.httpOnly)add("HttpOnly")
            if(options.path)add("Path", options.path)
            if(options.secure)add("Secure")
            if(options.sameSite)add("SameSite", options.sameSite)
            if(options.maxAge){
                // Override the expires value
                // expires provides better backwards compatability than
                // Max-Age
                const now = new Date()
                const expiry = new Date(0)
                expiry.setUTCMilliseconds(now.getTime()+Math.round(options.maxAge*1000))
                options.expires = expiry
            }
            if(options.expires){
                if(options.expires instanceof Date){
                    add("Expires", options.expires.toUTCString())
                }
                else{
                    const epochTime = new Date()
                    const seconds = Math.floor(options.expires / 1000)
                    const milliseconds = options.expires % 1000
                    epochTime.setUTCSeconds(seconds, milliseconds)
                    add("Expires", epochTime.toUTCString())
                }
            }
        }
        this.set("set-cookie", `${name}=${value};${optionsString}`)
        
        return this
    }
}
