import { ObjectSchemaTemplate } from "schematica";
import Request from "../io/Request";
import Response from "../io/Response"

export async function notFoundHandler(req:Request, res:Response){
    res.status(404)
    res.send({
        statusCode: 404,
        error: "Not Found",
        mba: "2k22"
    })
}

export const notFoundHandlerSchemas : {
    response: {
        all: ObjectSchemaTemplate
    }
} = {
    response: {
        "all": {
            type: "object",
            required: ["statusCode", "error"],
            properties: {
                statusCode: "number",
                error: "string",
                message: "string"
            },
            strict: true
        }
    }
}