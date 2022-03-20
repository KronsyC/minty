"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandlerSchemas = exports.notFoundHandler = void 0;
const tslib_1 = require("tslib");
function notFoundHandler(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        res.status(404)
            .send({
            statusCode: 404,
            error: "Not Found"
        });
    });
}
exports.notFoundHandler = notFoundHandler;
exports.notFoundHandlerSchemas = {
    response: {
        "all": {
            type: "object",
            required: ["statusCode", "error"],
            properties: {
                statusCode: "number",
                error: "string",
                message: "string"
            },
            strict: true
        }
    }
};
//# sourceMappingURL=notFoundHandler.js.map