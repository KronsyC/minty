export default interface WEB_ERROR extends Error{
    message: string;
    statusCode: number;
    name: string;
}