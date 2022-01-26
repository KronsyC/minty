export default class ERR_METHOD_NOT_ALLOWED extends Error{
    constructor(message:string="Method not Allowed"){
        super(message)
        this.name="ERR_METHOD_NOT_ALLOWED"
    }
}