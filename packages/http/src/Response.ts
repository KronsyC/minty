import { Readable } from "stream"
import { BaseRequest, BaseResponse as BaseResponse, ResponseHeaders } from "./types"
type ResponseEvent = "close" | "drain" | "error" | "pipe" | "finish" | "unpipe"
export default class Response{
    rawResponse : BaseResponse
    private sendResponse:(()=>void)|undefined=undefined
    constructor(res:BaseResponse) {
        this.rawResponse = res
        res.addListener("close", ()=> {

        })
    }

   get writable(){
       return this.rawResponse.writable
   }
   uncork(){
       this.rawResponse.uncork()
   }
   get statusMessage(){
       return this.rawResponse.statusMessage
   }
   set statusMessage(status:string){
       this.rawResponse.statusMessage = status
   }
   get statusCode(){
       return this.rawResponse.statusCode
   }
   set statusCode(status: number){
       this.rawResponse.statusCode = status
   }

   // FIXME: This method doesn't work
   // setDefaultEncoding(encoding: BufferEncoding){
   //     this._response.setDefaultEncoding(encoding)
   // }
   get sendDate(){
       return this.rawResponse.sendDate
   }
   pipe(destination:any, options?: {end?:boolean}){
       return this.rawResponse.pipe(destination, options)
   }


   get destroyed(){
       return this.rawResponse.destroyed
   }

   destroy(error?:Error){
       return this.rawResponse.destroy(error)
   }
   cork(){
       this.rawResponse.cork()
   }
   addTrailers(trailers:ResponseHeaders){
       this.rawResponse.addTrailers(trailers)
   }

   get req(){
       return <BaseRequest>this.rawResponse.req
   }

   end(data: string | Uint8Array, cb?: () => void){
       this.rawResponse.end(data, cb)
   }
   //#region Lister methods
   addListener(event: "close", listener: () => void) : BaseResponse
   addListener(event: "drain", listener: () => void) : BaseResponse
   addListener(event: "error", listener: (err:Error) =>void) : BaseResponse
   addListener(event: "finish", listener: () => void) : BaseResponse
   addListener(event: "pipe", listener: (src: Readable) => void) : BaseResponse
   addListener(event: "unpipe", listener: (src:Readable) => void) : BaseResponse
   addListener(event:string, listener:any){
       return this.on(<any>event, listener)
   }
   listenerCount(event:ResponseEvent){
       return this.rawResponse.listenerCount(event)
   }
   listeners(event:ResponseEvent){
       return this.rawResponse.listeners(event)
   }
   rawListeners(event:ResponseEvent){
       return this.rawResponse.rawListeners(event)
   }
   getMaxListeners(){
       return this.rawResponse.getMaxListeners()
   }
   removeListener(event: ResponseEvent, listener: () => void){
       this.rawResponse.removeListener(event, listener)
   }
   setMaxListeners(count:number){
       this.rawResponse.setMaxListeners(count)
   }
   prependListener(event:ResponseEvent, listener: () => void){
       this.rawResponse.prependListener(event, listener)
   }
   prependOnceListener(event: ResponseEvent, listener : () => void){
       this.rawResponse.prependListener(event, listener)
   }
   removeAllListeners(event:ResponseEvent){
       this.rawResponse.removeAllListeners(event)
   }
   off(event:ResponseEvent, listener: () => void){
       return this.removeListener(event, listener)
   }

   on(event: "close", listener: () => void) : BaseResponse
   on(event: "drain", listener: () => void) : BaseResponse
   on(event: "error", listener: (err:Error) =>void) : BaseResponse
   on(event: "finish", listener: () => void) : BaseResponse
   on(event: "pipe", listener: (src: Readable) => void) : BaseResponse
   on(event: "unpipe", listener: (src:Readable) => void) : BaseResponse
   on(event:string, listener:any){   
       return this.rawResponse.on(<any>event, listener)
   }
   eventNames(){
       return this.rawResponse.eventNames()
   }
   emit(event:ResponseEvent){
       return this.rawResponse.emit(event)
   }
   //#endregion
  //#region Header Methods
   get headersSent(){
       return this.rawResponse.headersSent
   }
   getHeader(name:string){
       return this.rawResponse.getHeader(name)
   }
   getHeaders(){
       return this.rawResponse.getHeaders()
   }
   getHeaderNames(){
       return this.rawResponse.getHeaderNames()
   }
   hasHeader(name:string){
       return this.rawResponse.hasHeader(name)
   }
   setHeader(name:string, value:string|number|string[]){
       this.rawResponse.setHeader(name.toLowerCase(), value)
   }
   //#endregion
   
}