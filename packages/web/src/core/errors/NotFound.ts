import WebError from "./WebError";

export default class NotFound extends WebError{
    constructor(message?:string) {
        super(404, message)
    }
}