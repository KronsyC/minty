/**
 * The MessageHandler Class is responsible for keeping the state of a single   
 * Request/Response Lifecycle
 */

import Context from "../Context"
import Handler from "../Handler";
import { kMessageHandler } from "../symbols";
import Request from "./Request"
import Response from "./Response"
export default class MessageHandler{
    request:Request
    response:Response

    context:Context;
    handler:Handler<any, any, any>;

    isComplete:boolean;
    createdAt: Date;


    constructor(req:Request, res:Response, handler:Handler<any, any, any>){
        this.request = req
        this.response = res
        this.handler = handler
        this.context = handler["context"]
        this.createdAt = new Date()
        this.isComplete = false

        //@ts-expect-error
        this.response[kMessageHandler] = this
        //@ts-expect-error
        this.request[kMessageHandler] = this
    }

}