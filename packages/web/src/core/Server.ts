import { ServerLifecycleStage } from './types';
import Context, { kRouter, kSchemaProvider } from './Context';
import HttpServer, { Request, Response } from '@mintyjs/http';
import { ListenMethod } from '../lib/types';
import sendError from '../util/sendError';
export const kBaseServer = Symbol("Base Server")
declare module "@mintyjs/http"{
  interface Request{
    params:{
      [x:string]:any;
    };
    query:{
      [x:string]:any
    }
  }
}
interface ServerOptions{
  poweredByHeader?: boolean
  prefix?:string;
}
const kServerState = Symbol("Server lifecycle stage")


/**
 * The Server lifecycle has 5 states
 * 1. Loading - Defining all of the routes, plugins, and hooks > ends with app.build()
 * 2. Building - The Server is loading all of the plugins, hooks, and schemas > ends automatically
 * 3  Ready - The Server is built and ready to start > ends with app.listen
 * 4. Online - The Server is running and listening for http requests > ends with app.close()
 * 5. Closed - The Server is closed
 */
/**
 * 
 */
export default class Server extends Context {
  [kBaseServer]:HttpServer

  private [kServerState]: ServerLifecycleStage = "loading";
  private serveroptions: ServerOptions;
  private poweredByHeader: boolean;
  constructor(options: ServerOptions={}) {
    super({prefix: options.prefix || "/"});
    this.poweredByHeader = options.poweredByHeader ?? true
    this.serveroptions = options
    this[kBaseServer] = new HttpServer({
      //TODO:Passthrough server configuration
    }, (req, res) => this.handleRequest(req, res));

  }
  public get stage(){
    return this[kServerState]
  }
  private async handleRequest(req: Request, res: Response) {
    try {
      this.poweredByHeader?res.setHeader("X-Powered-By", "MintWeb"):null
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Do a router lookup
        const { handler, params, query } = this[kRouter].find(req.url, req.method)
        req.params = params;
        req.query = query;

        await handler.handle(req, res);
    }
     catch (err: any) {
        sendError(err, res, this);
    }
}


  public build(){
    if(this[kServerState]==="loading"){
      this[kServerState] = "building"
      
      this._build()
      
      this[kServerState] = "ready"
    }
    else{
      throw new Error("Can only build from the loading state")
    }
  }
  public listen:ListenMethod = (arg1: any, arg2?: any, arg3?: any, arg4?: any) => {
    // Check if the server is already prepared
    // If yes, start the server,
    // Else, prepare, then start
    if(this.stage === "loading"){
      this.build()
    }
    if(this.stage !== "building"){
      this[kBaseServer].listen(arg1, arg2, arg3, arg4);
      console.log("Listening");
    }
    else{
      throw new Error(`Cannot listen from ${this.stage} state`)
    }

    
  }

}
