import HttpServer, { Method, Request as HttpRequest, Response as HttpResponse } from "@mintyjs/http"
import mimeAware from "@mintyjs/mime-aware"
import { Schema } from "fast-json-stringify"
// import Handler from "./Handler"
import Router from "@mintyjs/router"
import { HandlerCb } from "./types"

interface RouteParams{
    method:Method;
    path:string;
    handler:HandlerCb;
}

export default class MintyWeb{
    baseServer:HttpServer;
    // private router:Router<Handler>;
    constructor() {
        // this.router=new Router({})
        this.baseServer = new HttpServer({}, (req, res)=> this.listener(req,res))

        
    }
    private listener(req:HttpRequest,res:HttpResponse){
        res.end("Hello World")
        
    }

    // public addRoute(params:RouteParams){
    //     const pathHandler = new Handler({
    //         callback: params.handler
    //     })
    //     this.router.addRoute(
    //         params.path,
    //         params.method,
    //         pathHandler
    //     )
    // }

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
        this.baseServer.listen(arg1, arg2, arg3, arg4)
    }
    //#endregion
}