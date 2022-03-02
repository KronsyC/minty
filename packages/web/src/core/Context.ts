//////////////////////////////////////////////////////////////////////
// An Application is a context in which hooks and routers operate
// Each Application has it's own router which is mounted to its parent's router
// Each Application has a schema provider that inherits from it's parent
//////////////////////////////////////////////////////////////////////
export const kRouter = Symbol("Router")
export const kState = Symbol("State")
export const kSchemaProvider = Symbol("Schema Provider")
export const k5xxHandler = Symbol("Server side error handler function");
export const k4xxHandler = Symbol("Client side error handler function");
import Router from '@mintyjs/router';
import { RouteCallback } from '../lib/types';
import Handler, { HandlerSchemas } from './Handler';
import { Method } from '@mintyjs/http';
import SchemaProvider from './SchemaProvider';
interface RouteOptions {
    schemas?: HandlerSchemas
}
interface CreateRouteParams {
    method: Method;
    path: string;
    handler: RouteCallback;
    schemas? : HandlerSchemas
}


export default abstract class Context {
    [kRouter]:Router<Handler>;
    [kSchemaProvider]:SchemaProvider;

    constructor() {
        this[kRouter] = new Router({})
        this[kSchemaProvider] = new SchemaProvider()
    }


    public addRoute(params: CreateRouteParams) {
        const pathHandler = new Handler({
            listener: params.handler,
            context: this,
            schemas: params.schemas || {}
        });
        this[kRouter].addRoute(params.path, params.method, pathHandler);
    }

    //#region method abstractions
    get(path: string, options: RouteOptions, callback: RouteCallback): void;
    get(path: string, callback: RouteCallback): void;
    get(path: string, arg2:RouteOptions|RouteCallback, arg3?: RouteCallback): void {
        if(typeof(arg3)==="function" && typeof arg2 ==="object"){
            this.addRoute({
                method: "GET",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "GET",
                path: path,
                handler: <any>arg2
            });
        }
    }

    post(path: string, options: RouteOptions, callback: RouteCallback): void;
    post(path: string, callback: RouteCallback): void; 
    post(path:string, arg2:RouteOptions|RouteCallback, arg3?:RouteCallback){
        if(typeof(arg3)==="function"&&typeof arg2==="object"){
            this.addRoute({
                method: "POST",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "POST",
                path: path,
                handler: <any>arg2
            });
        }

    }
    put(path: string, options: RouteOptions, callback: RouteCallback): void;
    put(path: string, callback: RouteCallback): void;
    put(path:string, arg2:RouteOptions|RouteCallback, arg3?:RouteCallback){
        
        if(typeof(arg3)==="function"&&typeof arg2==="object"){
            this.addRoute({
                method: "PUT",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "PUT",
                path: path,
                handler: <any>arg2
            });
        }

    }

    patch(path: string, options: RouteOptions, callback: RouteCallback): void;
    patch(path: string, callback: RouteCallback): void;
    patch(path:string, arg2:RouteOptions|RouteCallback, arg3?:RouteCallback){
        
        if(typeof(arg3)==="function"&&typeof arg2==="object"){
            this.addRoute({
                method: "PATCH",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "PATCH",
                path: path,
                handler: <any>arg2
            });
        }

    }
    delete(path: string, options: RouteOptions, callback: RouteCallback): void;
    delete(path: string, callback: RouteCallback): void;
    delete(path:string, arg2:RouteOptions|RouteCallback, arg3?:RouteCallback){
        
        if(typeof(arg3)==="function"&&typeof arg2==="object"){
            this.addRoute({
                method: "DELETE",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "DELETE",
                path: path,
                handler: <any>arg2
            });
        }

    }
    options(path: string, options: RouteOptions, callback: RouteCallback): void;
    options(path: string, callback: RouteCallback): void;
    options(path:string, arg2:RouteOptions|RouteCallback, arg3?:RouteCallback){
        
        if(typeof(arg3)==="function"&&typeof arg2==="object"){
            this.addRoute({
                method: "OPTIONS",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "OPTIONS",
                path: path,
                handler: <any>arg2
            });
        }

    }

    head(path: string, options: RouteOptions, callback: RouteCallback): void;
    head(path: string, callback: RouteCallback): void;
    head(path:string, arg2:RouteOptions|RouteCallback, arg3?:RouteCallback){
        
        if(typeof(arg3)==="function"&&typeof arg2==="object"){
            this.addRoute({
                method: "HEAD",
                path: path,
                handler: arg3,
                schemas: arg2.schemas
            })
        }
        else{
            this.addRoute({
                method: "HEAD",
                path: path,
                handler: <any>arg2
            });
        }

    }
    //#endregion
}
