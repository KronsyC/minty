import { Schema } from 'fast-json-stringify';
import stringify = require('fast-json-stringify');
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
/**
 * Takes any data, serializes it, and returns it's appropriate MIME type
 *
 * @param data The Data you want to serialize
 * @param schema A fast-json-stringify schema
 */
export default function contentAwareSerialize(data: string|object|number|boolean|any[], schema: Schema) {
    const serializer = stringify(schema);
    const contentType = getContentType(data)
    const serialized = serializer(data)

    return [serialized, contentType]
}

function isHtml(data: string) {
    // Straight from stackoverflow baby
    return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(
        data
    );
}
