import mimeAware from "../mime"
import { HandlerCb } from "../types";
import {Request, Response} from "@mintyjs/http"
import WebRequest from "../../core/Request";
import WebResponse from "../../core/Response";
import Application from "./Application";
import mimeTypes from "mime-types"
import fs from "node:fs"
interface IHandlerParams{
    listener: HandlerCb;
    context:Application;
}

export default class Handler{
    private listener:HandlerCb;
    private context:Application
    constructor(params:IHandlerParams){
        this.listener=params.listener
        this.context=params.context
    }



    async handle(req:Request, res:Response){

        const requestUrlParams:any = req.params

        const webReq = new WebRequest(req, {
            params: requestUrlParams
        })
        const webRes = new WebResponse(res)
        
        async function sendCallback(data:any){
            if(typeof data==="string"&&data.startsWith("file@")){
                const dirname = data.slice(5)
                
                fs.readFile(dirname, (err, data)=>{
                    if(err)throw err
                    const mimeType = mimeTypes.contentType(dirname)
                    
                    if(mimeType){
                        res.setHeader("content-type", mimeType)
                        res.setHeader("content-length", data.buffer.byteLength)
                        res.end(data)
                    }
                    else{
                        throw new Error(`Could not get valid mime type for ${dirname}`)
                    }

                })
            }
            else{
                const [serialized, mimeType] = mimeAware(data)
                res.setHeader("content-type", mimeType+";charset=utf-8")
                res.end(serialized)
            }

        }

        webRes["sendCallback"] = sendCallback

        const bound = this.listener.bind(this.context)
        
        const data = await bound(webReq, webRes)
        
        if(data && !webRes.hasSent){
            const [serialized, mimeType] = mimeAware(data)
            mimeAware(data)
            
            res.setHeader("content-type", mimeType+";charset=utf-8")
            res.end(serialized)
            webRes.hasSent = true
        }
        else{
            // This can be ignored, the other case is
            // handled within sendCallback()
        }


    }
}