import Application from './util/Application';
import HttpServer, { Request, Response } from '@mintyjs/http';
import mimeAware from './mime';
import { ListenMethod } from './types';

export default class Server extends Application {
  baseServer: HttpServer;

  constructor() {
    super({prefix: ""});
    this.baseServer = new HttpServer({}, (req, res) => this.listener(req, res));
  }

  private async listener(req: Request, res: Response) {
    try {
      const handler = this.router.find(req.url, req.method);

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
          this.errorSerializer
        );
        res.statusCode = err.statusCode;
        res.setHeader('content-type', mimeType);
        res.end(data);
      }
    }
  }
  //#region listen method

  public listen:ListenMethod = (arg1: any, arg2?: any, arg3?: any, arg4?: any) => {
    this.state = 'ready';
    this.baseServer.listen(arg1, arg2, arg3, arg4);
  }
  //#endregion
}
