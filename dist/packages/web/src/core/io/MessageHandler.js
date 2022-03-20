"use strict";
/**
 * The MessageHandler Class is responsible for keeping the state of a single
 * Request/Response Lifecycle
 */
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
class MessageHandler {
    constructor(req, res, handler) {
        this.request = req;
        this.response = res;
        this.handler = handler;
        this.context = handler["context"];
        this.createdAt = new Date();
        this.isComplete = false;
        //@ts-expect-error
        this.response[symbols_1.kMessageHandler] = this;
        //@ts-expect-error
        this.request[symbols_1.kMessageHandler] = this;
    }
}
exports.default = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map