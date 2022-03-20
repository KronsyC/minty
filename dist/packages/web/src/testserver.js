"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = (0, tslib_1.__importDefault)(require("path"));
const NotFound_1 = (0, tslib_1.__importDefault)(require("./core/errors/NotFound"));
const Server_1 = (0, tslib_1.__importDefault)(require("./core/Server"));
const app = new Server_1.default();
app.static(path_1.default.join(__dirname, "static"));
app.get("hello", (req, res) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    throw new NotFound_1.default();
    return "Wassup";
}));
app.listen(3000, url => {
    console.log(`Server listening at ${url}`);
});
//# sourceMappingURL=testserver.js.map