import { Request as HTTPRequest, RequestHeaders } from "@mintyjs/http";
import { kBody, kParams, kQuery } from "../symbols";
import { Querystring, UrlParameters } from "../types";



interface WebRequestOpts<BodyType, ParamsType, QueryType>{
    query: QueryType;
    params:ParamsType
}

interface Headers extends RequestHeaders{}
class Headers{
    constructor(rawHeaders:RequestHeaders){
        for(let header in rawHeaders){
            this[header] = rawHeaders[header]
        }
    }
}

export default class Request<BodyType=any, ParamsType=UrlParameters, QueryType=Querystring>{
    readonly rawRequest:HTTPRequest;
    private [kQuery]: QueryType;
    private [kParams]: ParamsType;
    private [kBody]: BodyType
    readonly headers: Headers;
    constructor(req:HTTPRequest){
        this.rawRequest=req
        this.headers = new Headers(req.headers)
    }
    get query(){
        return this[kQuery]
    }
    get params(){
        return this[kParams]
    }
    get body(){
        return this[kBody]
    }
    get path(){
        return this.rawRequest.url.split("?")[0]
    }
    get method(){
        return this.rawRequest.method
    }
    get source(){
        return {
            ip: this.rawRequest.socket.remoteAddress,
            port: this.rawRequest.socket.remotePort
        }
    }
    get httpVersion(){
        const version = this.rawRequest.httpVersion
        return version
    }
}