///////////////////////////////////////////////////////////////
///// The WebError Class is inherited by all Errors that
///// propogate to the response
///////////////////////////////////////////////////////////////

import getGenericErrorMessage from "../../util/getGenericStatusMessage";



export default abstract class WebError extends Error{
    internal = false;
    statusCode:number;
    error:string;
    constructor(status:number=400, message?:string){
        super()
        this.error = getGenericErrorMessage(status)
        this.message = message ?? ""
        this.statusCode = status
    }
}