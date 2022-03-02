import Context, { kRouter, kSchemaProvider } from './Context';
import HttpServer, { Request, Response } from '@mintyjs/http';
import { ListenMethod } from '../lib/types';
import getGenericErrorMessage from '../util/getGenericStatusMessage';
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
export default class Server extends Context {
  [kBaseServer]:HttpServer
  constructor() {
    super();
    this[kBaseServer] = new HttpServer({
      //TODO:Passthrough server configuration
    }, (req, res) => this.listener(req, res));

  }

  private async listener(req: Request, res: Response) {

    try {
      // TODO: Make these headers configurable (i.e optional)
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN")
      res.setHeader("X-Powered-By", "WebMint")
      
      // Do a router lookup
      const {handler, params, query} = this[kRouter].find(req.url, req.method);
      
      req.params = params
      req.query = query    
  
      await handler.handle(req, res);
    } 
    catch (err: any) {
        sendError(err, res, this)
    }
  }

  public listen:ListenMethod = (arg1: any, arg2?: any, arg3?: any, arg4?: any) => {
    this[kBaseServer].listen(arg1, arg2, arg3, arg4);
  }

}
