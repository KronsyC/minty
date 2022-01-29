import { Response } from "@mintyjs/http";

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
    set(name:string, value: string|string[]|number){
        this.rawResponse.setHeader(name, value)
        return this
    }
}