///////////////////////////////////////////////////////////////
///// The WebError Class is inherited by all Errors that
///// propogate to the response
///////////////////////////////////////////////////////////////

import getGenericErrorMessage from "../../util/getGenericStatusMessage";



/**
 * The WebError Class is inherited by any errors that should be exposed to the user
 */
export default abstract class WebError extends Error{
    internal = false;
    statusCode:number;
    error:string;
    //@ts-expect-error
    message?:string
    constructor(status:number=400, message?:string){
        super()
        this.error = getGenericErrorMessage(status)
        this.message = message
        this.statusCode = status
    }
}