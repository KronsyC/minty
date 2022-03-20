"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const tslib_1 = require("tslib");
const getGenericStatusMessage_1 = (0, tslib_1.__importDefault)(require("../../util/getGenericStatusMessage"));
function errorHandler(req, res, err, context) {
    const statusCode = err.statusCode || 500;
    const error = (0, getGenericStatusMessage_1.default)(statusCode);
    const message = err.internal === false ? err.message : undefined;
    const constructed = {
        statusCode,
        error,
        message
    };
    res.send(constructed);
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map