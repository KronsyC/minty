import { GenericServer, Listener, ServerOptions } from '../util/types';
export default class Server {
    baseServer: GenericServer;
    listener?: Listener;
    private secure;
    constructor(options?: ServerOptions, listener?: Listener);
    /**
     * This method is meant to transform Generic Request/Responses into the
     * minty/http counterparts, and then pass them to the listener
     */
    private requestHandler;
    listen(port: number, host: string, backlog: number, callback: (host: string) => void): void;
    listen(port: number, host: string, callback: (host: string) => void): void;
    listen(port: number, callback: (host: string) => void): void;
    listen(callback: (host: string) => void): void;
    listen(port: number, backlog: number, callback: (host: string) => void): void;
    listen(address: string, callback: (host: string) => void): void;
    listen(address: string, backlog: number, callback: (host: string) => void): void;
}
