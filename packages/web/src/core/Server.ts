import { kBaseServer, kErrorSerializer, kRouter, kState } from '../lib/util/symbols';
import Application from '../lib/util/Application';
import HttpServer, { Request, Response } from '@mintyjs/http';
import mimeAware from '../lib/mime';
import { ListenMethod } from '../lib/types';

declare module "@mintyjs/http"{
  interface Request{
    params:{
      [x:string]:any;
    };
  }
}
export default class Server extends Application {
  [kBaseServer]:HttpServer

  constructor() {
    super();
    this[kBaseServer] = new HttpServer({

    }, (req, res) => this.listener(req, res));

  }

  private async listener(req: Request, res: Response) {

    res.setHeader("X-Powered-By", `MintyWeb ${this.version}`)
    try {
      res.setHeader("X-Content-Type-Options", "nosniff")
      const [handler, params] = this[kRouter].find(req.url, req.method);
      req.params = params      
      try {
        await handler.handle(req, res);
      } catch (err: any) {
        if (err.statusCode && typeof err.statusCode === 'number') {
          res.statusCode = err.statusCode;
          res.end(err.message);
        } else {
          res.statusCode = 500;
          res.end(err.message);
        }
      }
    } catch (err: any) {
      if (err.name && err.name.startsWith('ERR_')) {
        const [data, mimeType] = mimeAware(
          { statusCode: err.statusCode, error: err.name, message: err.message },
          this[kErrorSerializer]
        );
        res.statusCode = err.statusCode;
        res.setHeader('content-type', mimeType);
        res.end(data);
      }
    }
  }

  public listen:ListenMethod = (arg1: any, arg2?: any, arg3?: any, arg4?: any) => {
    this[kState] = 'ready';
    this[kBaseServer].listen(arg1, arg2, arg3, arg4);
  }
}
