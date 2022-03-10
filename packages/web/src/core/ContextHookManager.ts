import { Method } from "@mintyjs/http";
import Context, { kOnPluginLoadHandlers, kOnRouteRegisterHandlers } from "./Context";
import { HandlerSchemas } from "./Handler";
import Request from "./Request"
import Response from "./Response"
interface HookManagerOptions{
    context: Context
}
export interface RouteMetadata{
    path: string;
    method: Method;
    schemas: HandlerSchemas
    context: Context
}

type ContextEvent = "pluginLoad" | "routeRegister" | "preParse" | "preValidation" | "preSerialization" | "preHandle"
type DoneFunction = Function

export type OnPluginLoadListener = (context:Context, done:DoneFunction)=>void
export type OnRouteRegisterListener = (metadata:RouteMetadata, done:DoneFunction)=>void
type PreParseListener = (req:Request, res:Response, rawBody:string, done:DoneFunction)=>void;
type PreValidationListener = (req:Request, res:Response, done:DoneFunction)=>void
type PreHandlerListener = (req:Request, res:Response, done:DoneFunction)=>void
type PreSerializationListener = (req:Request, res:Response, done:DoneFunction)=>void

export type RegisterContextHookMethod = {
    (event:"pluginLoad", listener:OnPluginLoadListener ):void;
    (event:"routeRegister", listener:OnRouteRegisterListener):void;
    (event:"preParse", listener:PreParseListener):void;
    (event:"preValidation", listener:PreValidationListener):void;
    (event:"preSerialization", listener:PreSerializationListener):void;
    (event:"preHandle", listener:PreHandlerListener):void
}

export default class ContextHookManager{
    private context:Context;


    constructor(options:HookManagerOptions){
        this.context = options.context
    }

    register : RegisterContextHookMethod = (event, listener) => {
        switch(event){
            //////////////////////
            /// Build Time Hooks
            //////////////////////
            case "pluginLoad":
                this.context["deepGetChildren"]().forEach( child => {
                    //@ts-expect-error
                    child[kOnPluginLoadHandlers].push(listener)
                } )
                    //@ts-expect-error
                this.context[kOnPluginLoadHandlers].push(listener)
                break;
            case "routeRegister":
                
                this.context["deepGetChildren"]().forEach( child => {
                    //@ts-expect-error
                    child[kOnRouteRegisterHandlers].push(listener)
                } )
                    //@ts-expect-error
                this.context[kOnRouteRegisterHandlers].push(listener)
                break;

            ///////////////////
            /// Runtime Hooks
            ///////////////////

            
        }
    }
}