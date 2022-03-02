import { SchematicaError } from 'schematica/dist/Schematica';
import WebError from "../WebError";

export default class ERR_INVALID_BODY extends WebError{
    constructor(error:SchematicaError){
        super(400)
        
        this.name = error.type
        this.message = `${error.context} : ${error.reason}`
        
    }
}