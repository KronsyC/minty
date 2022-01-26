import HttpServer, { Request, Response } from "@mintyjs/http"
import Router from "./router/Router"
// import contentAware from "@mintyjs/mime-aware"



export default class MintyWeb{
    baseServer:HttpServer
    private router:Router
    constructor() {
        this.router=new Router({})
        this.baseServer = new HttpServer({}, (req, res)=> this.listener(req,res))

        this.router.addRoute("/api/posts/:id","GET", () => "Get post by id")
        this.router.addRoute("/api/posts/foo-:id","GET", () => "Get post by id foo")
        this.router.addRoute("/api/posts/:id-bar","GET", () => "Get post by id bar")
        this.router.addRoute("/api/posts/abc","GET", () => "Get post abc")

        this.router.addRoute("/api/users/12", "GET", ()=>"get user 12")
        this.router.addRoute("/api/analytics","POST", ()=>"analytics")
        this.router.addRoute("/api/auth",     "POST", ()=>"login with credentials")
        this.router.addRoute("/api/auth",     "GET", ()=>"Fetch access token with refresh token")

        
        const hndlr = this.router.find("/api/posts/abc", "GET")()

        console.log(`FOUND ROUTE HANDLER -- ${hndlr}`);
        
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