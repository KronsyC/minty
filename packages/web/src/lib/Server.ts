import HttpServer, { Request, Response } from "@mintyjs/http"
import Router from "./Router"
// import contentAware from "@mintyjs/mime-aware"



export default class MintyWeb{
    baseServer:HttpServer
    private router:Router
    constructor() {
        this.router=new Router({})
        this.baseServer = new HttpServer({}, (req, res)=> this.listener(req,res))

        this.router.addRoute("GET", "/api/posts/123", () => "Get Post 123")
        this.router.addRoute("PUT", "/api/posts/123", () => "Edit Post 123")
        this.router.addRoute("GET", "/api/users/12", ()=>"get user 12")
        this.router.addRoute("POST", "/api/analytics", ()=>"analytics")
        this.router.addRoute("POST", "/api/auth", ()=>"login route")


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