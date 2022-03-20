import { UrlParameters, Querystring, RouteCallback } from './types';
import { Method as HTTPMethod, Request as HttpRequest, Response as HttpResponse } from '@mintyjs/http';
import Context from './Context';
import { Presets } from 'schematica';
import { GenericSchema as Schema, ObjectSchema, ObjectSchemaTemplate, GenericSchemaTemplate as SchemaTemplate } from 'schematica';
import inferMimeType from '../util/inferMimeType';
import ERR_INVALID_BODY from './errors/misc/ERR_INVALID_BODY';
import Request from './io/Request';
import Response from './io/Response';
import { kBody, kCreateSendCallback, kCreateSendFileCallback, kInterceptors, kParams } from './symbols';
import MessageHandler from './io/MessageHandler';

type Method = HTTPMethod | 'ALL';
export interface IHandlerParams<BT, PT, QT> {
    listener: RouteCallback<BT, PT, QT>;
    context: Context;
    schemas: HandlerSchemas;
    method: Method;
    path: string;
    addToRouter?: boolean;
}

export interface HandlerSchemas {
    body?: SchemaTemplate;
    query?: ObjectSchemaTemplate;
    params?: ObjectSchemaTemplate;
    response?: {
        all?: SchemaTemplate;
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
        all: Schema;
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
export default class Handler<BodyType = any, ParamsType extends {} = UrlParameters, QueryType extends {} = Querystring> {
    private modifiedSchemas: string[] = [];
    private listener: RouteCallback<BodyType, ParamsType, QueryType>;
    private context: Context;
    method: Method;
    path: string;
    addToRouter: boolean;

    private schemaTemplates: HandlerSchemas;
    private schemas: InstantiatedHandlerSchemas;

    constructor(params: IHandlerParams<BodyType, ParamsType, QueryType>) {
        this.listener = params.listener;
        this.addToRouter = params.addToRouter ?? true;
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
                all: Presets.any,
            },
        };
        defaultSchemas.body.nullable = true;
        defaultSchemas.response['1xx'].nullable = true;
        defaultSchemas.response['2xx'].nullable = true;
        defaultSchemas.response['3xx'].nullable = true;
        defaultSchemas.response['4xx'].nullable = true;
        defaultSchemas.response['5xx'].nullable = true;
        defaultSchemas.response['all'].nullable = true;

        this.schemas = defaultSchemas;
    }
    /**
     * This Function is called to build all of the dependencies of the Handler, i.e Validators, Parsers, etc.
     */
    public build() {
        this.buildSchemas();

        this.buildResponseSerializers();

        this.buildParamsNormalizer();

        this.buildBodyParser();
    }

    private buildSchemas() {
        const json = this.context.schematicaInstance;

        const create = (template: any): any => {
            this.modifiedSchemas.push(template.id);
            return json.createSchema(template);
        };
        const tml = this.schemaTemplates;
        tml.params ? (this.schemas.params = create(tml.params)) : null;
        tml.query ? (this.schemas.query = create(tml.query)) : null;
        tml.body ? (this.schemas.body = create(tml.body)) : null;
        if (tml.response) {
            const res = tml.response;
            const ress = this.schemas.response;
            res['1xx'] ? (ress['1xx'] = create(res['1xx'])) : null;
            res['2xx'] ? (ress['2xx'] = create(res['2xx'])) : null;
            res['3xx'] ? (ress['3xx'] = create(res['3xx'])) : null;
            res['4xx'] ? (ress['4xx'] = create(res['4xx'])) : null;
            res['5xx'] ? (ress['5xx'] = create(res['5xx'])) : null;
            res['all'] ? (ress['all'] = create(res['all'])) : null;
        }
        // Set Names
        this.schemas.body.name = 'Body';
        this.schemas.query.name = 'Query';
        this.schemas.params.name = 'Params';
    }
    private buildResponseSerializers() {
        if (this.schemas.response) {
            for (const [name, schema] of Object.entries(this.schemas.response)) {
                this.context.schematicaInstance.buildSerializer(schema, { onAdditionalProperty: 'skip' });
            }
        }
    }
    private buildParamsNormalizer() {
        const wildCardSchema = Presets.string;
        // Force Wildcards in the schema
        this.schemas.params.properties.set('*', wildCardSchema);

        const normalizer = this.context.schematicaInstance.buildNormalizer(this.schemas.params);

        const validator = this.context.schematicaInstance.buildValidator(this.schemas.params);
        this.schemas.params.cache.set('normalizer', normalizer);
        this.schemas.params.cache.set('validator', validator);
    }
    private buildBodyParser() {
        //TODO: Move this functionality into schematica
        const schema = this.schemas.body;

        let parser: Function;
        const schematicaParser = this.context.schematicaInstance.buildParser(schema);

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

        const validator = this.context.schematicaInstance.buildValidator(schema);
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
    accumulateBody(req: Request<any, any, any>) {
        return new Promise<string>((res, rej) => {
            let rawBody = '';
            req.rawRequest.on('data', (c) => (rawBody += c));
            req.rawRequest.on('end', () => {
                res(rawBody);
            });
        });
    }
    async handle(messageHandler: MessageHandler) {

        const req = messageHandler.request;
        const res = messageHandler.response;
        if (req[kBody] === undefined) {
            const body = await this.accumulateBody(req);
            req[kBody] = this.parseBody(body);
        }

        try {

            // Parse the body
            const paramsNormalizer = this.schemas.params.cache.get('normalizer');

            let urlParameters = req.params ?? {};

            urlParameters = paramsNormalizer(urlParameters);

            // Update the request parameters with their normalized form
            req[kParams] = urlParameters;

            const context = this.context;

            res[kCreateSendCallback](this as any, req);

            // Execute all of the context request interceptors
            await this.executeRequestInterceptors(req, res);

            const routeHandler = this.listener.bind(this.context);

            routeHandler(req as any, res)
                .then((data) => {
                    if (data) {
                        res.send(data);
                    }
                })
                .catch((err) => {
                    context.sendError(req, res, err);
                });
        } catch (err: any) {
            this.context.sendError(req, res, err);
        }
    }
    getSchemaForStatus(code: number) {
        const schemas = this.schemas.response;
        let schema: Schema;
        const firstdigit = code.toString()[0];
        switch (firstdigit) {
            case '1':
                schema = schemas['1xx'];
                break;
            case '2':
                schema = schemas['2xx'];
                break;
            case '3':
                schema = schemas['3xx'];
                break;
            case '4':
                schema = schemas['4xx'];
                break;
            case '5':
                schema = schemas['5xx'];
                break;
            default:
                throw new Error(`Code ${code} is not a valid HTTP response code`);
        }
        if (!this.modifiedSchemas.includes(schema.id)) {
            schema = schemas['all'];
        }
        return schema;
    }
    serializeResponse(data: any, response: Response) {
        const schema = this.getSchemaForStatus(response.statusCode);

        let mimeType = inferMimeType(data, schema);

        const serializer = schema.cache.get('serializer');
        let serialized: string;
        if (
            typeof data === 'string' &&
            (schema.type === 'string' || schema.type === 'any') &&
            (!response.headers['content-type'] || (<string>response.headers['content-type']).startsWith('text/plain'))
        ) {
            serialized = data;
        } else {
            serialized = serializer(data);
        }

        if (serialized === null) {
            const info = serializer.error;
            const error: any = new Error(`${info.context} > ${info.reason}`);
            error.statusCode = 500;

            throw error;
        }

        return [serialized, mimeType];
    }

    async executeRequestInterceptors(req: Request, res: Response) {
        // Sequentially execute all request interceptors
        // Interceptors have the role of mutating data at certain stages
        return new Promise(async (resolve, reject) => {
            const interceptors = this.context[kInterceptors].request;
            let currentInterceptorIndex = -1;

            const callback = () => {
                currentInterceptorIndex++;
                if (currentInterceptorIndex >= interceptors.length) {
                    resolve(true);
                } else {
                    interceptors[currentInterceptorIndex](req, res, callback);
                }
            };
            callback();
        });
    }
    async executeResponseInterceptors(req: Request, res: Response) {
        // Sequentially execute all response interceptors
        // Interceptors have the role of mutating data at certain stages
        return new Promise(async (resolve, reject) => {
            const interceptors = this.context[kInterceptors].response;
            let currentInterceptorIndex = -1;

            const callback = () => {
                currentInterceptorIndex++;
                if (currentInterceptorIndex >= interceptors.length) {
                    resolve(true);
                } else {
                    const current = interceptors[currentInterceptorIndex];
                    //@ts-expect-error
                    current(req, res, callback);
                }
            };
            callback();
        });
    }
}
