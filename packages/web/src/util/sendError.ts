import Context, { kErrorSerializer } from "../core/Context";
import { Response } from "@mintyjs/http";
import getGenericErrorMessage from "./getGenericStatusMessage";

export default function sendError(err:any, res:Response, context:Context){
    const statusCode = err.statusCode||500
    const error = getGenericErrorMessage(statusCode)
    
    const message = err.internal===false?err.message||undefined:undefined
    const constructed = {
      statusCode: statusCode,
      error: error,
      message:message
    }
    res.statusCode = statusCode
    const serialized = context[kErrorSerializer](constructed)
    res.setHeader("content-type", "application/json")        
    res.end(serialized);
}