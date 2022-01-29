import WebRequest from "./Request"
import WebResponse from "./Response"

export type HandlerCb = (req:WebRequest,res:WebResponse)=>Promise<any>

export type Serializer = (doc:any)=>any