"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ERR_NOT_FOUND extends Error {
    constructor(message = "Not Found") {
        super(message);
        this.internal = false;
        this.name = "ERR_NOT_FOUND";
        this.statusCode = 404;
    }
}
exports.default = ERR_NOT_FOUND;
//# sourceMappingURL=ERR_NOT_FOUND.js.map