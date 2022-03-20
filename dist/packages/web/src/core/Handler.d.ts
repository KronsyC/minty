import { UrlParameters, Querystring, RouteCallback } from './types';
import { Method as HTTPMethod } from '@mintyjs/http';
import Context from './Context';
import { GenericSchema as Schema, ObjectSchemaTemplate, GenericSchemaTemplate as SchemaTemplate } from 'schematica';
import Request from './io/Request';
import Response from './io/Response';
import MessageHandler from './io/MessageHandler';
declare type Method = HTTPMethod | 'ALL';
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
 * A Handler is an isolated class responsible for invoking the user-provided callback and
 * performing any preprocessing to requests and responses
 *
 * A Handler is bound to the context in which it is instantiated
 */
export default class Handler<BodyType = any, ParamsType extends {} = UrlParameters, QueryType extends {} = Querystring> {
    private modifiedSchemas;
    private listener;
    private context;
    method: Method;
    path: string;
    addToRouter: boolean;
    private schemaTemplates;
    private schemas;
    constructor(params: IHandlerParams<BodyType, ParamsType, QueryType>);
    /**
     * This Function is called to build all of the dependencies of the Handler, i.e Validators, Parsers, etc.
     */
    build(): void;
    private buildSchemas;
    private buildResponseSerializers;
    private buildParamsNormalizer;
    private buildBodyParser;
    private parseBody;
    accumulateBody(req: Request<any, any, any>): Promise<string>;
    handle(messageHandler: MessageHandler): Promise<void>;
    getSchemaForStatus(code: number): Schema;
    serializeResponse(data: any, response: Response): string[];
    executeRequestInterceptors(req: Request, res: Response): Promise<unknown>;
    executeResponseInterceptors(req: Request, res: Response): Promise<unknown>;
}
export {};
