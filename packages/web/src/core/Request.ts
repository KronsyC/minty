import { Request, RequestHeaders } from "@mintyjs/http";

interface WebRequestOpts{
    params:{[x:string]:any}
}

export default class WebRequest{
    rawRequest:Request;
    params:Record<string ,string>
    constructor(req:Request, opts:WebRequestOpts){
        this.rawRequest=req
        this.params=opts.params
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