export default class ERR_NOT_FOUND extends Error{
    constructor(message:string="Not Found"){
        super(message)
        this.name="ERR_NOT_FOUND"
    }
}