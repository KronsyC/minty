import WEB_ERROR from "./WEB_ERROR"

export default class ERR_METHOD_NOT_ALLOWED extends Error implements WEB_ERROR{
    statusCode: number;
    constructor(message:string="Method not Allowed"){
        super(message)
        this.name="ERR_METHOD_NOT_ALLOWED"
        this.statusCode=405
    }
}