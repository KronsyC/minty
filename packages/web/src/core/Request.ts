import { Request, RequestHeaders } from "@mintyjs/http";
import { Querystring, UrlParameters } from "./types";

interface WebRequestOpts<BodyType, ParamsType, QueryType>{
    query: QueryType;
    params:ParamsType
    body: BodyType;
}

export default class WebRequest<BodyType=any, ParamsType=UrlParameters, QueryType=Querystring>{
    rawRequest:Request;
    params:ParamsType
    query:QueryType
    body:BodyType;
    constructor(req:Request, opts:WebRequestOpts<BodyType, ParamsType, QueryType>){
        this.rawRequest=req
        this.params=opts.params
        this.query=opts.query
        this.body= opts.body
    }

    get headers():RequestHeaders{
        return this.rawRequest.headers
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