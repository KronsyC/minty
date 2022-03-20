"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const WebError_1 = (0, tslib_1.__importDefault)(require("../WebError"));
class ERR_INVALID_BODY extends WebError_1.default {
    constructor(error) {
        super(400);
        this.name = error.type;
        this.message = `${error.context} : ${error.reason}`;
    }
}
exports.default = ERR_INVALID_BODY;
//# sourceMappingURL=ERR_INVALID_BODY.js.map