"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function listen(srv, secure, arg1, arg2, arg3, arg4) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    function invokeCallback(cb) {
        const address = srv.address();
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
    }
    else if (a1t === "number" && a2t === "string" && a3t === "function") {
        srv.listen(arg1, arg2, () => {
            invokeCallback(arg3);
        });
    }
    else if (a1t === "number" && a2t === "function") {
        srv.listen(arg1, "localhost", () => {
            invokeCallback(arg2);
        });
    }
    else if (a1t === "number" && a2t === "number" && a3t === "function") {
        srv.listen(arg1, "localhost", arg2, () => {
            invokeCallback(arg3);
        });
    }
    else if (a1t === "function") {
        srv.listen(3000, "localhost", () => invokeCallback(arg1));
    }
    else if (a1t === "string" && a2t === "number" && a3t === "function") {
        srv.listen(arg1, arg2, () => {
            invokeCallback(arg3);
        });
    }
    else if (a1t === "string" && a2t === "function") {
        srv.listen(arg1, () => {
            invokeCallback(arg2);
        });
    }
}
exports.default = listen;
//# sourceMappingURL=listenHelper.js.map