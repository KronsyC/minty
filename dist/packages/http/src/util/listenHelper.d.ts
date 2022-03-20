/// <reference types="node" />
import { AddressInfo } from "net";
export interface Listenable {
    listen: (a: any, b?: any, c?: any, d?: any) => void;
    address: () => AddressInfo | string | null;
}
export default function listen(srv: Listenable, secure: boolean, port: number, host: string, backlog: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure: boolean, port: number, host: string, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure: boolean, port: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure: boolean, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure: boolean, port: number, backlog: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure: boolean, address: string, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure: boolean, address: string, backlog: number, callback: (host: string) => void): void;
