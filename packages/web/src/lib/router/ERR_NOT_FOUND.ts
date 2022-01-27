import WEB_ERROR from "./WEB_ERROR"

export default class ERR_NOT_FOUND extends Error implements WEB_ERROR{
    statusCode: number;
    
    constructor(message:string="Not Found"){
        super(message)
        this.name="ERR_NOT_FOUND"
        this.statusCode = 404
    }
}