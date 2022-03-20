import { GenericSchema } from 'schematica';
/**
 *
 * @param data
 * @param schema
 *
 * This function takes in data and it's schema and tries it's best to infer a mime type
 */
export default function inferMimeType(data: any, schema: GenericSchema): "application/json" | "text/plain";
