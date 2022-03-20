"use strict";
///////////////////////////////////////////////////////////////
///// The WebError Class is inherited by all Errors that
///// propogate to the response
///////////////////////////////////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const getGenericStatusMessage_1 = (0, tslib_1.__importDefault)(require("../../util/getGenericStatusMessage"));
/**
 * The WebError Class is inherited by any errors that should be exposed to the user
 */
class WebError extends Error {
    constructor(status = 400, message) {
        super();
        this.internal = false;
        this.error = (0, getGenericStatusMessage_1.default)(status);
        this.message = message;
        this.statusCode = status;
    }
}
exports.default = WebError;
//# sourceMappingURL=WebError.js.map