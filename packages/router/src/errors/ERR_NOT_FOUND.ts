import WEB_ERROR from "./WEB_ERROR"

export default class ERR_NOT_FOUND extends Error implements WEB_ERROR{
    statusCode: number;
    internal = false;
    constructor(message="Not Found"){
        super(message)
        this.name="ERR_NOT_FOUND"
        this.statusCode = 404
    }
}