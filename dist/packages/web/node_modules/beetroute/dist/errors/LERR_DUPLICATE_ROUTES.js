"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LERR_DUPLICATE_ROUTES extends Error {
    constructor(message = "Duplicate routes registered") {
        super(message);
        this.name = "LERR_DUPLICATE_ROUTES";
    }
}
exports.default = LERR_DUPLICATE_ROUTES;
//# sourceMappingURL=LERR_DUPLICATE_ROUTES.js.map