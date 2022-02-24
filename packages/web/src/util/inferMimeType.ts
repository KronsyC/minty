import { GenericSchema } from 'schematica';
/**
 * 
 * @param data 
 * @param schema 
 * 
 * This function takes in data and it's schema and tries it's best to infer a mime type
 */
export default function inferMimeType(data:any, schema:GenericSchema){
    switch(schema.type){
        case "array":
        case "object":
        case "boolean":
        case "number":
            return "application/json";
        case "string":
            return "text/plain"
        case "any":
        default:
            
            if(typeof data==="object" || typeof data === "boolean"||typeof data==="number"){

                return "application/json"
            }
            else{
                return "text/plain"
            }
    }
}