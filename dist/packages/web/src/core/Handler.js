"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const schematica_1 = require("schematica");
const inferMimeType_1 = (0, tslib_1.__importDefault)(require("../util/inferMimeType"));
const ERR_INVALID_BODY_1 = (0, tslib_1.__importDefault)(require("./errors/misc/ERR_INVALID_BODY"));
const symbols_1 = require("./symbols");
/**
 * A Handler is an isolated class responsible for invoking the user-provided callback and
 * performing any preprocessing to requests and responses
 *
 * A Handler is bound to the context in which it is instantiated
 */
class Handler {
    constructor(params) {
        var _a;
        this.modifiedSchemas = [];
        this.listener = params.listener;
        this.addToRouter = (_a = params.addToRouter) !== null && _a !== void 0 ? _a : true;
        this.context = params.context;
        this.schemaTemplates = params.schemas;
        this.method = params.method;
        this.path = params.path;
        const defaultSchemas = {
            body: schematica_1.Presets.any,
            query: schematica_1.Presets.object,
            params: schematica_1.Presets.object,
            response: {
                '1xx': schematica_1.Presets.any,
                '2xx': schematica_1.Presets.any,
                '3xx': schematica_1.Presets.any,
                '4xx': schematica_1.Presets.any,
                '5xx': schematica_1.Presets.any,
                all: schematica_1.Presets.any,
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
    build() {
        this.buildSchemas();
        this.buildResponseSerializers();
        this.buildParamsNormalizer();
        this.buildBodyParser();
    }
    buildSchemas() {
        const json = this.context.schematicaInstance;
        const create = (template) => {
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
    buildResponseSerializers() {
        if (this.schemas.response) {
            for (const [name, schema] of Object.entries(this.schemas.response)) {
                this.context.schematicaInstance.buildSerializer(schema, { onAdditionalProperty: 'skip' });
            }
        }
    }
    buildParamsNormalizer() {
        const wildCardSchema = schematica_1.Presets.string;
        // Force Wildcards in the schema
        this.schemas.params.properties.set('*', wildCardSchema);
        const normalizer = this.context.schematicaInstance.buildNormalizer(this.schemas.params);
        const validator = this.context.schematicaInstance.buildValidator(this.schemas.params);
        this.schemas.params.cache.set('normalizer', normalizer);
        this.schemas.params.cache.set('validator', validator);
    }
    buildBodyParser() {
        //TODO: Move this functionality into schematica
        const schema = this.schemas.body;
        let parser;
        const schematicaParser = this.context.schematicaInstance.buildParser(schema);
        switch (schema.type) {
            case 'string':
                parser = (data) => {
                    return data;
                };
                break;
            case 'number':
                parser = (data) => {
                    return Number(data);
                };
                break;
            case 'any':
                parser = (data) => {
                    if (typeof data === 'string') {
                        return data;
                    }
                    else {
                        try {
                            return JSON.parse(data);
                        }
                        catch (_a) {
                            return undefined;
                        }
                    }
                };
                break;
            case 'boolean':
                parser = (data) => {
                    if (data === 'true')
                        return true;
                    else if (data === 'false')
                        return false;
                    else
                        return undefined;
                };
                break;
            case 'object':
            case 'array':
                parser = (data) => {
                    const parsed = schematicaParser(data);
                    return parsed;
                };
                break;
            default:
                throw new Error(`Cannot build parser for type ${schema.type}`);
        }
        const validator = this.context.schematicaInstance.buildValidator(schema);
        schema.cache.set('bodyParser', function parse(data) {
            try {
                const parsed = parser(data);
                if (validator(parsed)) {
                    return parsed;
                }
                else {
                    //@ts-ignore-error
                    throw new ERR_INVALID_BODY_1.default(validator.error);
                }
            }
            catch (err) {
                if (err.name === 'ERR_BAD_JSON') {
                    throw new ERR_INVALID_BODY_1.default({
                        context: 'Body',
                        reason: err.message,
                        type: 'ERR_BAD_JSON',
                    });
                }
                else if (err.name === 'ERR_INVALID_DATA') {
                    throw new ERR_INVALID_BODY_1.default(err.error);
                }
                else {
                    throw err;
                }
            }
        });
    }
    parseBody(data) {
        const parser = this.schemas.body.cache.get('bodyParser');
        return parser(data);
    }
    accumulateBody(req) {
        return new Promise((res, rej) => {
            let rawBody = '';
            req.rawRequest.on('data', (c) => (rawBody += c));
            req.rawRequest.on('end', () => {
                res(rawBody);
            });
        });
    }
    handle(messageHandler) {
        var _a;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const req = messageHandler.request;
            const res = messageHandler.response;
            if (req[symbols_1.kBody] === undefined) {
                const body = yield this.accumulateBody(req);
                req[symbols_1.kBody] = this.parseBody(body);
            }
            try {
                // Parse the body
                const paramsNormalizer = this.schemas.params.cache.get('normalizer');
                let urlParameters = (_a = req.params) !== null && _a !== void 0 ? _a : {};
                urlParameters = paramsNormalizer(urlParameters);
                // Update the request parameters with their normalized form
                req[symbols_1.kParams] = urlParameters;
                const context = this.context;
                res[symbols_1.kCreateSendCallback](this, req);
                // Execute all of the context request interceptors
                yield this.executeRequestInterceptors(req, res);
                const routeHandler = this.listener.bind(this.context);
                routeHandler(req, res)
                    .then((data) => {
                    if (data) {
                        res.send(data);
                    }
                })
                    .catch((err) => {
                    context.sendError(req, res, err);
                });
            }
            catch (err) {
                this.context.sendError(req, res, err);
            }
        });
    }
    getSchemaForStatus(code) {
        const schemas = this.schemas.response;
        let schema;
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
    serializeResponse(data, response) {
        const schema = this.getSchemaForStatus(response.statusCode);
        let mimeType = (0, inferMimeType_1.default)(data, schema);
        const serializer = schema.cache.get('serializer');
        let serialized;
        if (typeof data === 'string' &&
            (schema.type === 'string' || schema.type === 'any') &&
            (!response.headers['content-type'] || response.headers['content-type'].startsWith('text/plain'))) {
            serialized = data;
        }
        else {
            serialized = serializer(data);
        }
        if (serialized === null) {
            const info = serializer.error;
            const error = new Error(`${info.context} > ${info.reason}`);
            error.statusCode = 500;
            throw error;
        }
        return [serialized, mimeType];
    }
    executeRequestInterceptors(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            // Sequentially execute all request interceptors
            // Interceptors have the role of mutating data at certain stages
            return new Promise((resolve, reject) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const interceptors = this.context[symbols_1.kInterceptors].request;
                let currentInterceptorIndex = -1;
                const callback = () => {
                    currentInterceptorIndex++;
                    if (currentInterceptorIndex >= interceptors.length) {
                        resolve(true);
                    }
                    else {
                        interceptors[currentInterceptorIndex](req, res, callback);
                    }
                };
                callback();
            }));
        });
    }
    executeResponseInterceptors(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            // Sequentially execute all response interceptors
            // Interceptors have the role of mutating data at certain stages
            return new Promise((resolve, reject) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const interceptors = this.context[symbols_1.kInterceptors].response;
                let currentInterceptorIndex = -1;
                const callback = () => {
                    currentInterceptorIndex++;
                    if (currentInterceptorIndex >= interceptors.length) {
                        resolve(true);
                    }
                    else {
                        const current = interceptors[currentInterceptorIndex];
                        //@ts-expect-error
                        current(req, res, callback);
                    }
                };
                callback();
            }));
        });
    }
}
exports.default = Handler;
//# sourceMappingURL=Handler.js.map