import { Response as HTTPResponse } from '@mintyjs/http';
import Request from './Request';
import Handler from '../Handler';

export const kCreateSendCallback = Symbol('Create Send Callback Method');
const kSendCallback = Symbol('Send Callback');
const kSendFileCallback = Symbol('Send File Callback');
const kRedirectCallback = Symbol('Redirect Callback');
export default class WebResponse {
    rawResponse: HTTPResponse;
    private [kSendCallback]?: (data: any) => void;
    private [kSendFileCallback]?: (location: string) => void;
    private [kRedirectCallback]?: (location: string) => void;
    private hasSetStatusCode: boolean = false;
    public hasSent: boolean = false;
    constructor(res: HTTPResponse, req: Request) {
        this.rawResponse = res;
    }
    [kCreateSendCallback](handler: Handler, req: Request) {
        let sendAttempts=0;
        const context = handler['context'];
        this[kSendCallback] = (data: any) => {
            if(sendAttempts>10){
                // Poorly WritteError Handling can lead to infinite call stack, this is protection
                this.status(500)
                this.rawResponse.end("Server was unable to fulfil the request")
                return
            }

            try {
                const [serialized, mimeType] = handler.serializeResponse(data, this);

                if (!this.headers['content-type']) {
                    this.set('content-type', mimeType);
                }

                this.rawResponse.end(serialized);
                this.hasSent = true;
            } catch (err) {
                sendAttempts++
                context.sendError(req, this, err);
            }
        };
    }
    get headers() {
        return this.rawResponse.getHeaders();
    }
    get statusCode() {
        return this.rawResponse.statusCode;
    }
    status(code: number) {
        this.hasSetStatusCode = true;
        this.rawResponse.statusCode = code;
        return this;
    }

    send(data: any) {
        if (this[kSendCallback]) {
            if (!this.hasSent) {
                //@ts-expect-error
                this[kSendCallback](data);
            }
        } else {
            throw new Error('No Send callback found, please open a github issue');
        }
    }
    sendFile(location: string) {
        if (this[kSendFileCallback]) {
            if (!this.hasSent) {
                this.hasSent = true;
                //@ts-expect-error
                this[kSendFileCallback](location);
            } else {
                throw new Error('Cannot send response more than once');
            }
        } else {
            throw new Error('No Send callback found, please open a github issue');
        }
    }
    redirect(url: string) {
        if (this[kRedirectCallback]) {
            if (!this.hasSent) {
                this.hasSent = true;
                //@ts-expect-error
                this[kRedirectCallback](url);
            } else {
                throw new Error('Cannot send response more than once');
            }
        } else {
            throw new Error('No Redirect callback found, please open a github issue');
        }
    }
    set(name: string, value: string | string[] | number) {
        this.rawResponse.setHeader(name, value);
        return this;
    }
}
