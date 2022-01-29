import HttpServer, { Method, Request as HttpRequest, Response as HttpResponse } from "@mintyjs/http"
import mimeAware from "@mintyjs/mime-aware"
import fastJson, { Schema } from "fast-json-stringify"
import Router from "@mintyjs/router"
import { HandlerCb } from "./types"
import Handler from "./Handler"

interface RouteParams{
    method:Method;
    path:string;
    handler:HandlerCb;
}

export default class MintyWeb{
    baseServer:HttpServer;
    private router:Router<Handler>;
    private state: "ready"|"building"="building"
    private errorSerializer;

    constructor() {
        this.router=new Router({})
        this.baseServer = new HttpServer({}, (req, res)=> this.listener(req,res))
        this.errorSerializer = fastJson({
            title: "Error Schema",
            type: "object",
            properties: {
                statusCode: {
                    type: "number"
                },
                error: {
                    type: "string"
                },
                message: {
                    type: "string"
                }
            }
        })
        
    }
    private async listener(req:HttpRequest,res:HttpResponse){
        try{
            const handler = this.router.find(req.url, req.method)
            handler.handle(req, res)
            // res.end("Hello World")


            
        }
        catch(err:any){

            // console.log(JSON.stringify(err));
            
            if(err.name&&err.name.startsWith("ERR_")){
                const [data, mimeType] = await mimeAware(err, this.errorSerializer)
                res.setHeader("content-type", mimeType)
                res.end(data)
            }
        }
        
    }

    public addRoute(params:RouteParams){
        const pathHandler = new Handler({
            listener: params.handler
        })
        this.router.addRoute(
            params.path,
            params.method,
            pathHandler
        )
    }

    //#region listen method
    public listen(port:number, host:string, backlog:number, callback:(host:string)=>void):void
    public listen(port:number, host:string, callback:(host:string)=>void):void
    public listen(port:number, backlog:number, callback:(host:string)=>void):void
    public listen(port:number, callback:(host:string)=>void):void
    public listen(port:number):void
    public listen(address:string, backlog:number, callback:(host:string)=>void):void
    public listen(address:string, callback:(host:string)=>void):void
    public listen(address:string):void
    public listen(arg1:any, arg2?:any, arg3?:any, arg4?:any){
        this.state="ready"
        this.baseServer.listen(arg1, arg2, arg3, arg4)
    }
    //#endregion
}