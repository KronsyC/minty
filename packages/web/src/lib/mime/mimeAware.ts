import stringify, { Schema } from 'fast-json-stringify';
import InvalidMimeTypeError from './errors/InvalidMimeTypeError';
/**
 * Extracts the appropriate mime type from a piece of data
 *
 * @param data The Data you want to extract the mime type of
 * @returns The Mime type of the data
 */
export function getContentType(data: string|object|number|boolean|any[]) {
    switch (typeof data) {
        case 'string':
            if (isHtml(data)) {
                return 'text/html';
            } else {
                return 'text/plain';
            }
            break;
        case 'number':
            return 'application/json';
            break;
        case 'boolean':
            return 'application/json';
        case 'object':
            return 'application/json';
            break;
        case 'function':
            throw new InvalidMimeTypeError(
                'Cannot generate MIME type for value of type `function`'
            );
            break;
        default:
            return 'text/plain';
    }
}

console.time("prebuilding schemas")
const StaticSchemas = {
    string: stringify({type: "string"}),
    number: stringify({type:"number"}),
    boolean: stringify({type: "boolean"}),
    object: stringify({type:"object", additionalProperties:true}),
    array: stringify(
    {
        type:"array",
         items: {
         }
    })
}
console.timeEnd("prebuilding schemas")


function pregenSchema(type:"string"|"number"|"boolean"|"object"|"array"){
    switch(type){
        case "string":
            return StaticSchemas.string
        case "number":
            return StaticSchemas.number
        case "boolean":
            return StaticSchemas.boolean
        case "object":
            return StaticSchemas.object
        case "array":
            return StaticSchemas.array
    }
}

function getSerializerType(data:string|object|number|boolean|any[]){
    switch(typeof data){
        case "string":
            return "string"
        case "number":
            return "number"
        case "boolean":
            return "boolean"
        case "object":
            if(Array.isArray(data)){
                return "array"
            }
            else{
                return "object"
            }
    }
}

/**
 * Takes any data, serializes it, and returns it's appropriate MIME type
 *
 * @param data The Data you want to serialize
 * @param schema A fast-json-stringify schema
 */
export default function contentAwareSerialize(data: string|object|number|boolean|any[], serializer?:(doc:any)=>any) {    
    const hasSerializer = Boolean(serializer)

    if(!hasSerializer){
        const type:any = getSerializerType(data)

        serializer = pregenSchema(type)
    }

    const contentType = getContentType(data)
    
    if(typeof data === "string"){    
        return [data, contentType]
    }
    else{      
        const serialized = serializer!(data)

        return [serialized, contentType]
    }


}

function isHtml(data: string) {
    // Straight from stackoverflow baby

    return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(
        data
    );
}
