import fastJson from "fast-json-stringify"

export default function createErrorSerializer(){
    return fastJson({
        title: 'Error Schema',
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      });
}