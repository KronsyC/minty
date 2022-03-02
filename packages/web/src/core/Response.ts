import { Response } from "@mintyjs/http";
import fs from "fs"
import path from "path"
import mimeTypes from "mime-types"
interface IWebResponseOptions{
    sendCallback: (res:WebResponse) => void
}

export default class WebResponse{
    rawResponse:Response
    private _sendCallback?:(data:any)=>void
    private _sendFileCallback?:(location:string)=>void
    public hasSent:boolean=false
    constructor(res:Response) {
        this.rawResponse = res
    }
    private set sendCallback(func:(data:any)=>void){
        this._sendCallback=func
    }
    private set sendFileCallback(func:(location:string)=>void){
        this._sendFileCallback = func
    }
    get headers(){
        return this.rawResponse.getHeaders()
    }
    get statusCode(){
        return this.rawResponse.statusCode
    }
    status(code:number){
        this.rawResponse.statusCode = code
        return this
    }

    send(data:any){
        if(this._sendCallback){
            if(!this.hasSent){
                this.hasSent = true
                this._sendCallback(data)
            }
            else{
                throw new Error("Cannot send response more than once")
            }

        }
        else{
            throw new Error("No Send callback found, please open a github issue")
        }
    }
    sendFile(location:string){  
        if(this._sendFileCallback){
            if(!this.hasSent){
                this.hasSent = true
                this._sendFileCallback(location)
            }
            else{
                throw new Error("Cannot send response more than once")
            }

        }
        else{
            throw new Error("No Send callback found, please open a github issue")
        }
    }
    set(name:string, value: string|string[]|number){
        this.rawResponse.setHeader(name, value)
        return this
    }
}