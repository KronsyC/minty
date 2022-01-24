import HttpServer, { Request, Response } from "@mintyjs/http"
import mimeAware from "@mintyjs/mime-aware"



export default class MintWeb{
    baseServer:HttpServer
    constructor() {
        this.baseServer = new HttpServer({}, (req, res)=> this.listener(req,res))
    }

    private listener(req:Request,res:Response){
        res.end("Hello World")
    }
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
}