/**
 * Both Server and nested plugin contexts extend the application class
 */
import Router from '@mintyjs/router';
import { HandlerCb, RouteOptions } from '../types';
import Handler from './Handler';
import createErrorSerializer from '../helpers/createErrorSerializer';
import { Method } from '@mintyjs/http';
import Plugin from './Plugin';
import { kRouter, kErrorSerializer, kState, kPrefix } from "./symbols"
interface CreateRouteParams {
    method: Method;
    path: string;
    handler: HandlerCb;
    options?:RouteOptions;
  }
function annotateName(target:Application, name:string, desc:any) {
    var method = desc.value;
    desc.value = function () {
        var prevMethod = this.currentMethod;
        this.currentMethod = name;
        method.apply(this, arguments);
        this.currentMethod = prevMethod;   
    }
}
interface AppOptions {
    router?:Router<Handler>
}

export default class Application {
    currentMethod!:string;
    //#region constructor
    [kRouter]:Router<Handler>;
    [kErrorSerializer] = createErrorSerializer();
    [kState]:'ready' | 'building' = 'building';
    [kPrefix]:string = ""
    version="1.0.1"
    protected set prefix(prefix:string){
        this[kPrefix] = prefix
        this[kRouter].prefix = prefix
    }
    protected get prefix(){
        return this[kPrefix]
    }
    constructor(opts?: AppOptions) {
        this[kRouter] = new Router({})
    }
    //#endregion

    public addPlugin(pluggable:typeof Plugin){
        const plugin = new pluggable()
        plugin.preLoad()
        plugin[kRouter].parentRouter = this[kRouter]
        plugin.register()
        this[kRouter].addSubrouter(plugin[kRouter])
        

    }

    public addRoute(params: CreateRouteParams) {
        if (this[kState] === 'ready') {
            throw new Error(
                'Cannot Register new listeners once app has started'
            );
        }
        const pathHandler = new Handler({
            listener: params.handler,
            context: this
        });
        this[kRouter].addRoute(params.path, params.method, pathHandler);
    }

    //#region method abstractions
    get(path: string, options: RouteOptions, callback: HandlerCb): void;
    get(path: string, callback: HandlerCb): void;
    @annotateName
    get(path: string, arg2:RouteOptions|HandlerCb, arg3?: HandlerCb): void {
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }
    }

    post(path: string, options: RouteOptions, callback: HandlerCb): void;
    post(path: string, callback: HandlerCb): void; 
    @annotateName
    post(path:string, arg2:RouteOptions|HandlerCb, arg3?:HandlerCb){
        
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }

    }
    put(path: string, options: RouteOptions, callback: HandlerCb): void;
    put(path: string, callback: HandlerCb): void;
    @annotateName
    put(path:string, arg2:RouteOptions|HandlerCb, arg3?:HandlerCb){
        
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }

    }

    patch(path: string, options: RouteOptions, callback: HandlerCb): void;
    patch(path: string, callback: HandlerCb): void;
    @annotateName
    patch(path:string, arg2:RouteOptions|HandlerCb, arg3?:HandlerCb){
        
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }

    }
    delete(path: string, options: RouteOptions, callback: HandlerCb): void;
    delete(path: string, callback: HandlerCb): void;
    @annotateName
    delete(path:string, arg2:RouteOptions|HandlerCb, arg3?:HandlerCb){
        
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }

    }
    options(path: string, options: RouteOptions, callback: HandlerCb): void;
    options(path: string, callback: HandlerCb): void;
    @annotateName
    options(path:string, arg2:RouteOptions|HandlerCb, arg3?:HandlerCb){
        
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }

    }

    head(path: string, options: RouteOptions, callback: HandlerCb): void;
    head(path: string, callback: HandlerCb): void;
    @annotateName
    head(path:string, arg2:RouteOptions|HandlerCb, arg3?:HandlerCb){
        
        if(typeof(arg3)==="function"){
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: arg3,
                options:arg2
            })
        }
        else{
            this.addRoute({
                method: <any>this.currentMethod.toUpperCase(),
                path: path,
                handler: <any>arg2
            });
        }

    }
    //#endregion
}
