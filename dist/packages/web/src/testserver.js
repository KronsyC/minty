"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Server_1 = (0, tslib_1.__importDefault)(require("./core/Server"));
const app = new Server_1.default();
app.listen(3000, url => {
    console.log(`Server listening at ${url}`);
});
//# sourceMappingURL=testserver.js.map