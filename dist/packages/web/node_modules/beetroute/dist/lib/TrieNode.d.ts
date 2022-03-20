import Router from "./Router";
import { Method } from "./types";
interface PathHandlers<HT> {
    GET?: HT;
    POST?: HT;
    PUT?: HT;
    DELETE?: HT;
    PATCH?: HT;
    OPTIONS?: HT;
    TRACE?: HT;
    HEAD?: HT;
    CONNECT?: HT;
    ALL?: HT;
}
interface TrieNodeOptions<HT> {
    handlers?: PathHandlers<HT>;
    overridable?: boolean;
}
export default class TrieNode<HT> {
    terminal: boolean;
    children: TrieNode<HT>[];
    handlers?: PathHandlers<HT>;
    value?: any;
    name: string;
    router: Router<HT>;
    rootNode: boolean;
    /**
     * This is some metadata which tells the router wether to allow
     * the user to overwrite the specific route or throw an error
     *
     * defaults to false
     */
    overridable: boolean;
    /**
     *
     * @param router An Instance of a Router
     * @param name The Name of the route segment
     * @param handlers An Object Representing the mappings of HTTP methods to The Chosen Handler Type
     */
    constructor(router: Router<HT>, name: string, options?: TrieNodeOptions<HT>);
    private extractPath;
    private routePartsMatch;
    private isMatch;
    addChild(node: TrieNode<HT>): void;
    /**
     *
     * @param name
     * @param exact This parameter prevents pattern matching
     * @returns The actual name of the handler or undefined
     */
    hasChild(name: string, exact?: boolean): string | undefined;
    getChild(name: string): TrieNode<HT>;
    hasTerminalChild(): boolean;
    addHandler(method: Method, handler: HT): void;
    getHandler(method: Method): HT | undefined;
}
export {};
