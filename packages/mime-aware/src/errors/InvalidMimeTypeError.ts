export default class InvalidMimeTypeError extends Error{
    constructor(message:string="Cannot generate mime type for value") {
        super(message)
        this.name="ERR_INVALID_MIMETYPE"
    }
}