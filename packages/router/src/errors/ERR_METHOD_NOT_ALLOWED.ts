import WEB_ERROR from "./WEB_ERROR"

export default class ERR_METHOD_NOT_ALLOWED extends Error implements WEB_ERROR{
    statusCode: number;
    internal = false;
    constructor(message="Method Not Allowed"){
        super(message)
        this.name="ERR_METHOD_NOT_ALLOWED"
        this.statusCode=405
    }
}