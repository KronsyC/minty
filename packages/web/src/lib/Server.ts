import HttpServer, { Request, Response } from "@mintyjs/http"
import mimeAware from "@mintyjs/mime-aware"
import Router from "./router/Router"
// import contentAware from "@mintyjs/mime-aware"



export default class MintyWeb{
    baseServer:HttpServer
    private router:Router
    constructor() {
        this.router=new Router({})
        this.baseServer = new HttpServer({}, (req, res)=> this.listener(req,res))
        
    }

    private listener(req:Request,res:Response){
        try{
            this.router.find( req.url, req.method )
        }
        catch(err:any){
            console.log(err);
            if(err.name.startsWith("ERR_")){
                let errorResponse = {
                    statusCode: err.statusCode,
                    error: err.name,
                    message: err.message
                }
                res.statusCode = err.statusCode || 500
                const [data, mimeType] = mimeAware(errorResponse, {
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
                console.log(mimeType);
                
                res.setHeader("content-type", mimeType)
                res.end(data)
            }

            res.end(err.name)
            
        }
        
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