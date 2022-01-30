/**
 * Both Server and nested plugin contexts extend the application class
 */

import Router from '@mintyjs/router';
import { HandlerCb, PluginCallback } from '../types';
import Handler from './Handler';
import createErrorSerializer from '../helpers/createErrorSerializer';
import { Method } from '@mintyjs/http';
import Plugin from './Plugin';

interface RouteParams {
    method: Method;
    path: string;
    handler: HandlerCb;
}
interface UsePluginOptions {
    prefix: string;
}
interface AppOptions {
    prefix?: string;
    router?:Router<Handler>
}
export default class Application {
    protected router: Router<Handler>;
    protected errorSerializer = createErrorSerializer();
    protected state: 'ready' | 'building' = 'building';
    protected prefix: string = '';
    constructor(opts?: AppOptions) {
        if(opts?.router){
            this.router=opts.router
        }
        else{
            this.router=new Router({})
        }
        if(opts?.prefix){
            this.prefix=opts.prefix
        }
    }

    public addPlugin(plugin:typeof Plugin){
        const pluggable = new plugin()
        const prefix = pluggable.prefix

    }

    public addRoute(params: RouteParams) {
        if (this.state === 'ready') {
            throw new Error(
                'Cannot Register new listeners once server has started'
            );
        }
        const pathHandler = new Handler({
            listener: params.handler,
        });
        this.router.addRoute(this.prefix+params.path, params.method, pathHandler);
    }

    //#region method abstractions
    public get(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'GET',
            path: path,
            handler: callback,
        });
    }
    public post(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'POST',
            path: path,
            handler: callback,
        });
    }
    public put(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'PUT',
            path: path,
            handler: callback,
        });
    }
    public patch(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'PATCH',
            path: path,
            handler: callback,
        });
    }
    public delete(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'DELETE',
            path: path,
            handler: callback,
        });
    }
    public options(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'OPTIONS',
            path: path,
            handler: callback,
        });
    }
    public head(path: string, callback: HandlerCb) {
        this.addRoute({
            method: 'HEAD',
            path: path,
            handler: callback,
        });
    }
    //#endregion
}
