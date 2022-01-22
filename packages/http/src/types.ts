/**
 * This file holds types which are commonly reused throughout the package
 */
import {
    Server as Http1Server,
    IncomingMessage,
    ServerResponse as Http1ServerResponse,
    IncomingHttpHeaders,
    OutgoingHttpHeaders
} from 'http';
import { Server as HttpsServer } from 'https';
import {
    Http2Server,
    Http2ServerRequest,
    Http2ServerResponse,
    ServerOptions as Http2ServerOptions
} from 'http2';
import Request from './Request';
import Response from './Response';
import { PxfObject, SecureContext, SecureVersion, TLSSocket } from 'tls';

export type GenericServer = Http2Server | Http1Server | HttpsServer;
export type BaseRequest = IncomingMessage | Http2ServerRequest;
export type BaseResponse = Http1ServerResponse | Http2ServerResponse;

export type RequestHeaders = IncomingHttpHeaders;
export type ResponseHeaders = OutgoingHttpHeaders;

export type Listener = (req: Request, res: Response) => void;

export interface Http2Options extends Http2ServerOptions {}

export interface SecureServerOptions {
    allowHalfOpen?: boolean;
    ALPNProtocols?: string[] | Uint8Array | Uint8Array[];
    ca?: string | Buffer | (string | Buffer)[];
    cert?: string | Buffer | (string | Buffer)[];
    ciphers?: string;
    clientCertEngine?: string;
    crl?: string | Buffer | (string | Buffer)[];
    dhparam?: string | Buffer;
    ecdhCurve?: string;
    enableTrace?: boolean;
    handshakeTimeout?: number;
    honorCipherOrder?: boolean;
    key?: string | Buffer | (string | Buffer)[];
    maxVersion?: SecureVersion;
    minVersion?: SecureVersion;
    passphrase?: string;
    pauseOnConnect?: boolean;
    pfx?: string | Buffer | (string | Buffer | PxfObject)[];
    privateKeyEngine?: string;
    privateKeyIdentifier?: string;
    pskCallback?: (socket: TLSSocket, identity: string) => DataView | NodeJS.TypedArray | null;
    pskIdentityHint?: string;
    rejectUnauthorized?: boolean;
    requestCert?: boolean;
    secureContext?: SecureContext;
    SNICallback?: (
        servername: string,
        cb: (err: Error | null, ctx: SecureContext | undefined) => void
    ) => void;
    secureOptions?: number;
    secureProtocol?: string;
    sessionIdContext?: string;
    sessionTimeout?: number;
    sigalgs?: string;
    ticketKeys?: Buffer;
}
export interface ServerOptions {
    http2?: Http2Options | boolean;
    https?: SecureServerOptions;
    maxHeaderSize?: number;
    insecureHttpParser?: boolean;
}
