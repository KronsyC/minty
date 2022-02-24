import { RouteCallback } from "../lib/types";
import {Request, Response} from "@mintyjs/http"
import WebRequest from "./Request";
import WebResponse from "./Response";
import Context, { kSchemaProvider } from "./Context";
import mimeTypes from "mime-types"
import {Presets} from "schematica"
import fs from "node:fs"
import { GenericSchema as Schema, ObjectSchema, ObjectSchemaTemplate, GenericSchemaTemplate as SchemaTemplate } from "schematica"
import inferMimeType from "../util/inferMimeType";
interface IHandlerParams{
    listener: RouteCallback;
    context:Context;
    schemas: HandlerSchemas;
}

/**
 * These are the schema constructors used to build request validators and response serializers
 */
export interface HandlerSchemas{
    request?: SchemaTemplate;
    query?:ObjectSchemaTemplate;
    params?:ObjectSchemaTemplate;
    response?: {
        "1xx"?:SchemaTemplate;
        "2xx"?:SchemaTemplate;
        "3xx"?:SchemaTemplate;
        "4xx"?:SchemaTemplate;
        "5xx"?:SchemaTemplate;
    }

}
/**
 * Initialized Schema instances used for serialization and validation, defaults as anySchema or non-strict objectschema
 */
interface InstantiatedHandlerSchemas{
    request: Schema;
    query:ObjectSchema;
    params:ObjectSchema;
    response: {
        "1xx":Schema;
        "2xx":Schema;
        "3xx":Schema;
        "4xx":Schema;
        "5xx":Schema;
    }
}
const defaultSchemas : InstantiatedHandlerSchemas = {
    request: Presets.any,
    query: Presets.object,
    params: Presets.object,
    response: {
        "1xx": Presets.any,
        "2xx": Presets.any,
        "3xx": Presets.any,
        "4xx": Presets.any,
        "5xx": Presets.any
    }
}

/**
 * A Handler is an isolated class responsible for invoking the user-provided callback and
 * performing any necessary operations on the data before sending it out
 */
export default class Handler{
    private listener:RouteCallback;
    private context:Context

    private schemaTemplates : HandlerSchemas
    private schemas: InstantiatedHandlerSchemas = defaultSchemas;

    constructor(params:IHandlerParams){
        this.listener=params.listener
        this.context=params.context
        this.schemaTemplates=params.schemas
        this.buildSchemas()
        this.buildResponseSerializers()
    }
    buildSchemas(){
        const json = this.context[kSchemaProvider]
        const tml = this.schemaTemplates
        tml.params?this.schemas.params = json.createSchema(tml.params):null
        tml.query?this.schemas.query = json.createSchema(tml.query) : null
        tml.request?this.schemas.request = json.createSchema(tml.request):null
        if(tml.response){
            const res = tml.response
            const ress=this.schemas.response
            res["1xx"]?ress["1xx"] = json.createSchema(res["1xx"]):null
            res["2xx"]?ress["2xx"] = json.createSchema(res["2xx"]):null
            res["3xx"]?ress["3xx"] = json.createSchema(res["3xx"]):null
            res["4xx"]?ress["4xx"] = json.createSchema(res["4xx"]):null
            res["5xx"]?ress["5xx"] = json.createSchema(res["5xx"]):null   
        }

        
        
    }
    buildResponseSerializers(){
        if(this.schemas.response){
            for(const [name, schema] of Object.entries(this.schemas.response)){
                
                this.context[kSchemaProvider].buildSerializer(schema)
            }
            // console.log(this.schemas.response);
            

        }
    }

    async handle(req:Request, res:Response){

        const webReq = new WebRequest(req, {
            params: req.params,
            query: req.query
        })
        const webRes = new WebResponse(res)
        
        const sendCallback = (data:any) =>{
            if(typeof data==="string"&&data.startsWith("file@")){
                // File responses are internally represented as file@location
                console.log(data);
                
                const dirname = data.slice(5)
                
                fs.readFile(dirname, (err, data)=>{
                    if(err)throw err
                    const mimeType = mimeTypes.contentType(dirname)
                    
                    if(mimeType){
                        res.setHeader("content-type", mimeType)
                        res.setHeader("content-length", data.buffer.byteLength)
                        res.end(data)
                    }
                    else{
                        throw new Error(`Could not get valid mime type for ${dirname}`)
                    }

                })
            }
            else{
                const [serialized, mimeType] = this.serializeResponse(data, webRes)
                if(!res.getHeader("content-type")){
                    res.setHeader("content-type", mimeType)
                }
                res.end(serialized)
            }


        }
        webRes["sendCallback"] = sendCallback
        const bound = this.listener.bind(this.context) 
        const data = await bound(webReq, webRes)
        
        if(data && !webRes.hasSent){
            const [serialized, mimeType] = this.serializeResponse(data, webRes)
            if(!res.getHeader("content-type")){
                res.setHeader("content-type", mimeType)
            }
            res.end(serialized)
            webRes.hasSent = true
        }


    }
    getSchemaForStatus(code:number){
        const schemas = this.schemas.response
        const firstDigit = code.toString()[0]
        switch(firstDigit){
            case "1":
                return schemas["1xx"]
            case "2":
                return schemas["2xx"]
            case "3":
                return schemas["3xx"]
            case "4":
                return schemas["4xx"]
            case "5":
                return schemas["5xx"]

            default:
                throw new Error(`Code ${status} is not a valid HTTP response code`)
        }
    }
    serializeResponse(data:any, response:WebResponse){
        const schema = this.getSchemaForStatus(response.statusCode)
        let mimeType = inferMimeType(data, schema)

        // Special case for strings when the mime type is text/plain, or unset
        if(typeof data === "string"&&( (response.headers["content-type"] as String) || "".startsWith("text/plain") || !response.headers["content-type"])){
            const validator = schema.cache.get("validator")

            validator(data)

            return [data, mimeType]
        }

        const serializer = schema.cache.get("serializer")
        const serialized = serializer(data)
        return [serialized, mimeType]

    }
}