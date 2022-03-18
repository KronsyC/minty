"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ERR_METHOD_NOT_ALLOWED extends Error {
    constructor(message = "Method Not Allowed") {
        super(message);
        this.internal = false;
        this.name = "ERR_METHOD_NOT_ALLOWED";
        this.statusCode = 405;
    }
}
exports.default = ERR_METHOD_NOT_ALLOWED;
//# sourceMappingURL=ERR_METHOD_NOT_ALLOWED.js.map