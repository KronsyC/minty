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
    public hasSent:boolean=false
    constructor(res:Response) {
        this.rawResponse = res
    }
    private set sendCallback(func:(data:any)=>void){
        this._sendCallback=func
    }
    get statusCode(){
        return this.rawResponse.statusCode
    }
    status(code:number){
        this.rawResponse.statusCode = code
        return this
    }
    private _send(data:any){
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
    send(data:any){
        this._send(data)
    }
    sendFile(location:string){  
        if(fs.existsSync(location))   {
            this._send(`file@${location}`)        
        }  
        else{
            throw new Error(`File ${location} does not exist`)
        }
    }
    set(name:string, value: string|string[]|number){
        this.rawResponse.setHeader(name, value)
        return this
    }
}