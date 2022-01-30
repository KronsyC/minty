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
interface AppOptions {
    router?:Router<Handler>
}
export default class Application {
    //#region constructor
    protected router: Router<Handler>;
    protected errorSerializer = createErrorSerializer();
    protected state: 'ready' | 'building' = 'building';
    protected _prefix: string = '';
    protected set prefix(prefix:string){
        this._prefix = prefix
        this.router.prefix = prefix
        
    }
    protected get prefix(){
        return this._prefix
    }
    constructor(opts?: AppOptions) {
        this.router = new Router({})
    }
    //#endregion

    public addPlugin(pluggable:typeof Plugin){
        const plugin = new pluggable()
        plugin.preLoad()
        plugin.router.parentRouter = this.router
        plugin.register()
        this.router.addSubrouter(plugin.router)
        

    }

    public addRoute(params: RouteParams) {
        if (this.state === 'ready') {
            throw new Error(
                'Cannot Register new listeners once app has started'
            );
        }
        const pathHandler = new Handler({
            listener: params.handler,
        });
        this.router.addRoute(params.path, params.method, pathHandler);
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
