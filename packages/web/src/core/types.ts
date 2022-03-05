import Context from "./Context";

/**
 * A Query is defined as an object which can contain other Querystrings, i.e user[id]=123 etc.
 */
export interface Querystring{
    [x:string]:any|Querystring
}

export interface UrlParameters{
    [x:string]:any
}

export interface PluginOptions{
    prefix?: string;
    logLevel?: number
}

export type PluginCallback<ConfigType extends PluginOptions = PluginOptions> = {
    (app: Context, options: ConfigType, done:any) : void;
    global?: boolean;
}

export type ServerLifecycleStage = "loading" | "building" | "ready" | "online" | "closed"
    