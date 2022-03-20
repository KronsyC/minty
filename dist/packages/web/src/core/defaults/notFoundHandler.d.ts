import { ObjectSchemaTemplate } from "schematica";
import Request from "../io/Request";
import Response from "../io/Response";
export declare function notFoundHandler(req: Request, res: Response): Promise<void>;
export declare const notFoundHandlerSchemas: {
    response: {
        all: ObjectSchemaTemplate;
    };
};
