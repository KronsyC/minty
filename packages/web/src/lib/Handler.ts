import mimeAware from '@mintyjs/mime-aware';
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

        const data = await this.listener(webReq, webRes)
        console.time("mimeAware")
        const [serialized, mimeType] = await mimeAware(data)
        console.timeEnd("mimeAware")

        res.setHeader("content-type", mimeType)
        res.end(serialized)
    }
}