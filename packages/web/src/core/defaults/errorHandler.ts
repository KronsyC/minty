import getGenericErrorMessage from "../../util/getGenericStatusMessage";
import Context from "../Context";
import Request from "../io/Request"
import Response from "../io/Response"

export function errorHandler(req:Request, res:Response, err:any, context:Context){
    const statusCode = err.statusCode||500
    const error = getGenericErrorMessage(statusCode)
    const message = err.internal === false?err.message:undefined
    
    const constructed = {
        statusCode,
        error,
        message
    }
    
    res.send(constructed)
}
