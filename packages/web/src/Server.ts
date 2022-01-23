import HttpServer, {} from "@mintyjs/http"




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
    public listen(arg1?:unknown, arg2?:unknown, arg3?:unknown, arg4?:unknown){

    }
}