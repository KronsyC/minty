import { UrlParameters, Querystring } from './types';
import { RouteCallback } from '../lib/types';
import { Method, Request, Response } from '@mintyjs/http';
import WebRequest from './Request';
import WebResponse from './Response';
import Context, { kSchemaProvider } from './Context';
import mimeTypes from 'mime-types';
import { presets, Presets } from 'schematica';
import fs from 'node:fs';
import { GenericSchema as Schema, ObjectSchema, ObjectSchemaTemplate, GenericSchemaTemplate as SchemaTemplate } from 'schematica';
import inferMimeType from '../util/inferMimeType';
import ERR_INVALID_BODY from './errors/misc/ERR_INVALID_BODY';
import sendError from '../util/sendError';
import NotFound from './errors/NotFound';
export interface IHandlerParams<BT, PT, QT> {
    listener: RouteCallback<BT, PT, QT>;
    context: Context;
    schemas: HandlerSchemas;
    method: Method;
    path: string;
}

/**
 * These are the schema constructors used to build request validators and response serializers
 */
export interface HandlerSchemas {
    body?: SchemaTemplate;
    query?: ObjectSchemaTemplate;
    params?: ObjectSchemaTemplate;
    response?: {
        '1xx'?: SchemaTemplate;
        '2xx'?: SchemaTemplate;
        '3xx'?: SchemaTemplate;
        '4xx'?: SchemaTemplate;
        '5xx'?: SchemaTemplate;
    };
}
/**
 * Initialized Schema instances used for serialization and validation, defaults as anySchema or non-strict objectschema
 */
interface InstantiatedHandlerSchemas {
    body: Schema;
    query: ObjectSchema;
    params: ObjectSchema;
    response: {
        '1xx': Schema;
        '2xx': Schema;
        '3xx': Schema;
        '4xx': Schema;
        '5xx': Schema;
    };
}


/**
 * A Handler is an isolated class responsible for invoking the user-provided callback and
 * performing any preprocessing to requests and responses
 *
 * A Handler is bound to the context in which it is instantiated
 */
export default class Handler<BodyType = any, ParamsType = UrlParameters, QueryType = Querystring> {



    private listener: RouteCallback<BodyType, ParamsType, QueryType>;
    private context: Context;
    method: Method;
    path: string;

    private schemaTemplates: HandlerSchemas;
    private schemas: InstantiatedHandlerSchemas;

    constructor(params: IHandlerParams<BodyType, ParamsType, QueryType>) {
        this.listener = params.listener;
        this.context = params.context;
        this.schemaTemplates = params.schemas;
        this.method = params.method;
        this.path = params.path;

        const defaultSchemas: InstantiatedHandlerSchemas = {
            body: Presets.any,
            query: Presets.object,
            params: Presets.object,
            response: {
                '1xx': Presets.any,
                '2xx': Presets.any,
                '3xx': Presets.any,
                '4xx': Presets.any,
                '5xx': Presets.any,
            },
        };
        defaultSchemas.body.nullable = true;
        defaultSchemas.response['1xx'].nullable = true;
        defaultSchemas.response['2xx'].nullable = true;
        defaultSchemas.response['3xx'].nullable = true;
        defaultSchemas.response['4xx'].nullable = true;
        defaultSchemas.response['5xx'].nullable = true;

        this.schemas = defaultSchemas
    }
    /**
     * This Function is called to build all of the dependencies of the Handler, i.e Validators, Parsers, etc.
     */
    public build() {
        this.buildSchemas();
        this.buildResponseSerializers();
        this.buildParamsNormalizer()
        this.buildBodyParser();
    }

    private buildSchemas() {
        const json = this.context[kSchemaProvider];
        const tml = this.schemaTemplates;
        tml.params ? (this.schemas.params = json.createSchema(tml.params)) : null;
        tml.query ? (this.schemas.query = json.createSchema(tml.query)) : null;
        tml.body ? (this.schemas.body = json.createSchema(tml.body)) : null;
        if (tml.response) {
            const res = tml.response;
            const ress = this.schemas.response;
            res['1xx'] ? (ress['1xx'] = json.createSchema(res['1xx'])) : null;
            res['2xx'] ? (ress['2xx'] = json.createSchema(res['2xx'])) : null;
            res['3xx'] ? (ress['3xx'] = json.createSchema(res['3xx'])) : null;
            res['4xx'] ? (ress['4xx'] = json.createSchema(res['4xx'])) : null;
            res['5xx'] ? (ress['5xx'] = json.createSchema(res['5xx'])) : null;
        }
        // Set Names
        this.schemas.body.name = 'Body';
        this.schemas.query.name = 'Query';
        this.schemas.params.name = 'Params';
    }
    private buildResponseSerializers() {
        if (this.schemas.response) {
            for (const [name, schema] of Object.entries(this.schemas.response)) {
                this.context[kSchemaProvider].buildSerializer(schema, {onAdditionalProperty: "skip"});
            }
        }
    }
    private buildParamsNormalizer(){
        const wildCardSchema = Presets.string
        // Force Wildcards in the schema
        this.schemas.params.properties.set("*", wildCardSchema)
        const normalizer = this.context[kSchemaProvider].buildNormalizer(this.schemas.params)
        const validator = this.context[kSchemaProvider].buildValidator(this.schemas.params)
        this.schemas.params.cache.set("normalizer", normalizer)
        this.schemas.params.cache.set("validator", validator)
    }
    private buildBodyParser() {
        const schema = this.schemas.body;

        let parser: Function;
        const schematicaParser = this.context[kSchemaProvider].buildParser(schema);

        switch (schema.type) {
            case 'string':
                parser = (data: any) => {
                    return data;
                };
                break;
            case 'number':
                parser = (data: any) => {
                    return Number(data);
                };
                break;
            case 'any':
                
                parser = (data: any) => {
                    
                    if (typeof data === 'string') {
                        
                        return data;
                    } else {
                        try {
                            return JSON.parse(data);
                        } catch {
                            return undefined;
                        }
                    }
                };
                break;
            case 'boolean':
                parser = (data: any) => {
                    if (data === 'true') return true;
                    else if (data === 'false') return false;
                    else return undefined;
                };
                break;
            case 'object':
            case 'array':
                parser = (data: any) => {
                    
                    const parsed = schematicaParser(data);

                    return parsed;
                };
                break;
            default:
                
                throw new Error(`Cannot build parser for type ${schema.type}`);
        }
        
        const validator = this.context[kSchemaProvider].buildValidator(schema);
        schema.cache.set('bodyParser', function parse(data: string) {
            
            try {
                
                const parsed = parser(data);                
                
                if (validator(parsed)) {
                    return parsed;
                } else {
                    //@ts-ignore-error
                    throw new ERR_INVALID_BODY(validator.error);
                }
            } catch (err: any) {
                if (err.name === 'ERR_BAD_JSON') {
                    throw new ERR_INVALID_BODY({
                        context: 'Body',
                        reason: err.message,
                        type: 'ERR_BAD_JSON',
                    });
                } else if (err.name === 'ERR_INVALID_DATA') {
                    throw new ERR_INVALID_BODY(err.error);
                } else {
                    throw err;
                }
            }
        });
    }
    private parseBody(data: string) {
        const parser = this.schemas.body.cache.get('bodyParser');

        return parser(data);
    }

    async handle(req: Request, res: Response) {

        let rawBody = '';
        req.on('data', (chunk) => (rawBody += chunk));
        req.on('end', async () => {
            
            try {
                // Parse the body
                const body = this.parseBody(rawBody);
                const paramsNormalizer = this.schemas.params.cache.get("normalizer")

                let urlParameters;
                try{
                    urlParameters = paramsNormalizer(req.params)
                }
                catch(err:any){
                    
                    //TODO: Fix the normalizer code so that it forwards the validator error
                    err.statusCode = 400
                    err.internal = false
                    
                    sendError(err, res, this.context)
                    return
                }
                
                
                const webReq = new WebRequest<BodyType, ParamsType, QueryType>(req, {
                    params: urlParameters as ParamsType,
                    query: req.query as QueryType,
                    body: body as BodyType,
                });
                const webRes = new WebResponse(res);

                const sendCallback = (data:any) => {
                    try{
                        
                        const [serialized, mimeType] = this.serializeResponse(data, webRes);
                        
                        if (!res.getHeader('content-type')) {
                            res.setHeader('content-type', mimeType);
                        }
                        
                        res.end(serialized);
                        webRes.hasSent=true
                    }
                    catch(err){
                        
                        
                        sendError(err, res, this.context)
                    }

                }
                const sendFileCallback = (location: string) => {
                    fs.readFile(location, (err, data) => {
                        if (err){
                            sendError(new NotFound(`Could not ${req.method} ${req.url}`), res, this.context)
                            return
                        };
                        const mimeType = mimeTypes.contentType(location);

                        if (mimeType) {
                            res.setHeader('content-type', mimeType);
                            res.setHeader('content-length', data.buffer.byteLength);
                            res.end(data);
                        } else {
                            sendError(new Error(`Could not get valid mime type for ${location}`), res, this.context)
                        }
                    });
                };

                const redirectCallback = (url:string) => {
                    // Redirect to an external location
                    if(!webRes["hasSetStatusCode"]){
                        res.statusCode = 307
                    }
                    res.setHeader("location", url)
                    res.end("Redirect")
                }
                webRes["_redirectCallback"] = redirectCallback
                webRes['sendCallback'] = sendCallback;
                webRes['sendFileCallback'] = sendFileCallback;
                const routeHandler = this.listener.bind(this.context);
                routeHandler(webReq, webRes).then((data) => {
                    if (data && !webRes.hasSent) {
                        sendCallback(data)
                    }
                });
            } catch (err:any) {                
                sendError(err, res, this.context);
            }
        });

    }
    getSchemaForStatus(code: number) {
        const schemas = this.schemas.response;
        const firstDigit = code.toString()[0];
        switch (firstDigit) {
            case '1':
                return schemas['1xx'];
            case '2':
                return schemas['2xx'];
            case '3':
                return schemas['3xx'];
            case '4':
                return schemas['4xx'];
            case '5':
                return schemas['5xx'];

            default:
                throw new Error(`Code ${code} is not a valid HTTP response code`);
        }
    }
    serializeResponse(data: any, response: WebResponse) {
        const schema = this.getSchemaForStatus(response.statusCode);
        
        let mimeType = inferMimeType(data, schema);
        
        // Special case for strings when the mime type is text/plain, or unset
        if (typeof data === 'string' && ((response.headers['content-type'] as String) || ''.startsWith('text/plain') || !response.headers['content-type'])) {
            let validator = schema.cache.get('validator');
            if (!validator) {
                // Hot-build validator, only happens once
                validator = this.context[kSchemaProvider].buildValidator(schema);
            }
            if(validator(data)){
                return [data, mimeType];
            }
            else{
                throw new Error("Bad")
            }

        }

        const serializer = schema.cache.get('serializer');
        
        const serialized = serializer(data);
        return [serialized, mimeType];
    }
}
