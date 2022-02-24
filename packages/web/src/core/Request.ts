import { Request, RequestHeaders } from "@mintyjs/http";

interface WebRequestOpts{
    query: Query;
    params:{[x:string]:any}
}
interface Query{
    [x:string]:any|Query
}
export default class WebRequest{
    rawRequest:Request;
    params:{[x:string]:any}
    query:Query
    constructor(req:Request, opts:WebRequestOpts){
        this.rawRequest=req
        this.params=opts.params
        this.query=opts.query
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