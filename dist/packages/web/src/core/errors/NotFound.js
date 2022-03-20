"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const WebError_1 = (0, tslib_1.__importDefault)(require("./WebError"));
class NotFound extends WebError_1.default {
    constructor(message) {
        super(404, message);
    }
}
exports.default = NotFound;
//# sourceMappingURL=NotFound.js.map