import Context, { kRouter, kSchemaProvider } from './Context';
import HttpServer, { Request, Response } from '@mintyjs/http';
import { ListenMethod } from '../lib/types';
import getGenericErrorMessage from '../util/getGenericStatusMessage';
export const kBaseServer = Symbol("Base Server")
export const kErrorSerializer = Symbol("Error Serializer")
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
  [kErrorSerializer]:Function
  constructor() {
    super();
    this[kBaseServer] = new HttpServer({
      //TODO:Passthrough server configuration
    }, (req, res) => this.listener(req, res));
    this.buildErrorSerializer()
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
        const statusCode = err.statusCode||500
        const error = getGenericErrorMessage(statusCode)
        
        const message = err.internal===false?err.message||undefined:undefined
        const constructed = {
          statusCode: statusCode,
          error: error,
          message:message
        }
        res.statusCode = statusCode
        const serialized = this[kErrorSerializer](constructed)
        res.setHeader("content-type", "application/json")        
        res.end(serialized);
    }
  }

  public listen:ListenMethod = (arg1: any, arg2?: any, arg3?: any, arg4?: any) => {
    this[kBaseServer].listen(arg1, arg2, arg3, arg4);
  }
  private buildErrorSerializer(){
    const schema = this[kSchemaProvider].createSchema({
      type: "object",
      required: ["statusCode", "error"],
      properties:{
        statusCode: {
          type: "number",
          min: 100,
          max:599
        },
        error: "string",
        message: "string"
      },
      strict: true
    })
    this[kErrorSerializer] = this[kSchemaProvider].buildSerializer(schema)
  }
}
