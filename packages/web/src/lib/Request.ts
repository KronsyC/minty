import { Request, RequestHeaders } from "@mintyjs/http";

export default class WebRequest{
    rawRequest:Request;
    constructor(req:Request){
        this.rawRequest=req
    }

    get headers():RequestHeaders{
        return this.rawRequest.headers
    }
}