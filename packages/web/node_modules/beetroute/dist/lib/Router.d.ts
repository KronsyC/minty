import { Method } from "./types";
interface RouterConfig {
    ignoreTrailingSlash?: boolean;
    parameterSeparators?: string[];
    prefix?: string;
}
/**
 * REFERENCE
 *              * = wildcard route
 *              ** = Root Wildcard route
 */
export default class Router<HT> {
    private radixTree;
    private ignoreTrailingSlash;
    private parameterSeparators;
    constructor(config: RouterConfig);
    parentRouter?: Router<HT>;
    private prefix;
    private _addRoute;
    addRoute(path: string, method: Method, handler: HT, overridable?: boolean): void;
    private _find;
    /**
     * @description Gets the handler associated with an action
     * @summary
     * Takes a path and method, and returns a handler
     * - Throws ERR_METHOD_NOT_ALLOWED if the route does not support the specified method
     * - Throws ERR_NOT_FOUND if the route doesn't have any handlers
     *
     * @param path The path you want to fetch a handler for
     * @param method The HTTP method of the route
     */
    find(path: string, method: Method): {
        handler: HT;
        params: {
            [x: string]: string;
        };
    };
    migrate(): void;
    /**
     * Routers can have scoped child routers which write their routes to the parent under a prefix
     * @param path The Base Path of the new Router
     * @param router The Child Router Object
     */
    addSubrouter(router: Router<HT>): void;
}
export {};
