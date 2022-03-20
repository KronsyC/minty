import WEB_ERROR from "./WEB_ERROR";
export default class ERR_NOT_FOUND extends Error implements WEB_ERROR {
    statusCode: number;
    internal: boolean;
    constructor(message?: string);
}
