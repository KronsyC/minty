import WEB_ERROR from "./WEB_ERROR";
export default class ERR_METHOD_NOT_ALLOWED extends Error implements WEB_ERROR {
    statusCode: number;
    internal: boolean;
    constructor(message?: string);
}
