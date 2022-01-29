import mimeAware from "./mime"
import { HandlerCb } from "./types";
import {Request, Response} from "@mintyjs/http"
import WebRequest from "./Request";
import WebResponse from "./Response";
import fastJson from "fast-json-stringify"
interface IHandlerParams{
    listener: HandlerCb
}

export default class Handler{
    private listener:HandlerCb
    constructor(params:IHandlerParams){
        this.listener=params.listener
    }



    async handle(req:Request, res:Response){

        const webReq = new WebRequest(req)
        const webRes = new WebResponse(res)
        async function sendCallback(data:any){
            const [serialized, mimeType] = mimeAware(data)
            res.setHeader("content-type", mimeType)
            res.end(serialized)
        }

        webRes["sendCallback"] = sendCallback

        const data = await this.listener(webReq, webRes)
        if(data && !webRes.hasSent){
            const [serialized, mimeType] = mimeAware(data)
            mimeAware(data)
            
            res.setHeader("content-type", mimeType)
            res.end(serialized)
            webRes.hasSent = true
        }
        else{
            // This can be ignored, the other case is
            // handled within sendCallback()
        }


    }
}