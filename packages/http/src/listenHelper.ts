import { AddressInfo } from "net";

export interface Listenable{
    listen: (a:any,b?:any, c?:any, d?:any) => {}
    address: ()=>AddressInfo|string|null
}

// I hate this just as much as you do
export default function listen(srv: Listenable, secure:boolean, port: number, host: string, backlog: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, port: number, host: string, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, port: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, port: number, backlog: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, address: string, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, address: string, backlog: number, callback: (host: string) => void): void;
export default function listen(srv: Listenable, secure:boolean, arg1: any, arg2?: any, arg3?: any, arg4?: any) { 
    function invokeCallback(cb: Function) {
       
      const address = <AddressInfo>srv.address();
      const prefix = secure ? "https://" : "http://";
      const port = address.port;
      const hostname = address.address;
      cb(`${prefix}${hostname}:${port}`);
   }
   const a1t = typeof arg1;
   const a2t = typeof arg2;
   const a3t = typeof arg3;
   const a4t = typeof arg4;
   if (a1t === "number" && a2t === "string" && a3t === "number" && a4t === "function") {
      srv.listen(arg1, arg2, arg3, () => {
         invokeCallback(arg4);
      });
   } else if (a1t === "number" && a2t === "string" && a3t === "function") {
      srv.listen(arg1, arg2, () => {
         invokeCallback(arg3);
      });
   } else if (a1t === "number" && a2t === "function") {
      srv.listen(arg1, "localhost", () => {
         invokeCallback(arg2);
      });
   } else if (a1t === "number" && a2t === "number" && a3t === "function") {
      srv.listen(arg1, "localhost", arg2, () => {
         invokeCallback(arg3);
      });
   } else if (a1t === "function") {
      srv.listen(3000, "localhost", () => invokeCallback(arg1));
   } else if (a1t === "string" && a2t === "number" && a3t === "function") {
      srv.listen(arg1, arg2, () => {
         invokeCallback(arg3);
      });
   } else if (a1t === "string" && a2t === "function") {
      srv.listen(arg1, () => {
         invokeCallback(arg2);
      });
   }
}
