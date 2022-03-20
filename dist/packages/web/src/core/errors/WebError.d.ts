/**
 * The WebError Class is inherited by any errors that should be exposed to the user
 */
export default abstract class WebError extends Error {
    internal: boolean;
    statusCode: number;
    error: string;
    message?: string;
    constructor(status?: number, message?: string);
}
