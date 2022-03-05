import ERR_METHOD_NOT_ALLOWED from '../errors/ERR_METHOD_NOT_ALLOWED';
import ERR_NOT_FOUND from '../errors/ERR_NOT_FOUND';
import LERR_DUPLICATE_ROUTES from '../errors/LERR_DUPLICATE_ROUTES';
import printTree from './printTree';
import TrieNode from './TrieNode';
import { Method } from './types';
import fmtUrl from "@mintyjs/fmturl"
interface RouterConfig {
    ignoreTrailingSlash?: boolean;
    parameterSeparators?: string[];
    prefix?: string;
}

interface QueryType{
    [x:string]:any|QueryType
}
/**
 * REFERENCE
 *              * = wildcard route
 *              _* = Root Wildcard route
 */
export default class Router<HT> {
    //#region constructor
    private radixTree: TrieNode<HT>; // The root node of the tree
    private ignoreTrailingSlash: boolean = true;
    private parameterSeparators: string[] = ['-', '+'];
    constructor(config: RouterConfig) {
        config.ignoreTrailingSlash
            ? (this.ignoreTrailingSlash = config.ignoreTrailingSlash)
            : null;
        config.parameterSeparators
            ? (this.parameterSeparators = config.parameterSeparators)
            : null;
        const prefix = fmtUrl(config.prefix||"/", this.ignoreTrailingSlash)
        this.prefix = prefix

        this.radixTree = new TrieNode(this, prefix);
        this.radixTree.rootNode = true;
    }
    //#endregion
    parentRouter?: Router<HT>;
    private prefix: string = '/';
    private _addRoute(path: string, method: Method, handler: HT) {
        const location = path.split('/');

        if (location[0] === '') {
            this.radixTree.addHandler(method, handler);
        } else {
            let currentNode: TrieNode<HT> = this.radixTree;
            location.forEach((part, index) => {
                if (currentNode.hasChild(part, true)) {
                    currentNode = currentNode.getChild(part);

                    // if it's the last child, set it as a terminal and add method
                    if (index === location.length - 1) {
                        currentNode.terminal = true;
                        if (currentNode.handlers) {
                            if (!currentNode.handlers[method]) {
                                currentNode.handlers[method] = handler;
                            } else {
                                throw new LERR_DUPLICATE_ROUTES(
                                    `Duplicate Handlers registered for ${method} ${path}`
                                );
                            }
                        } else {
                            let hndlr: any = {};
                            hndlr[method] = handler;
                            currentNode.handlers = hndlr;
                        }
                    }
                } else {
                    // If last part, generate terminal and add methods
                    if (index === location.length - 1) {
                        let hndlr: any = {};
                        hndlr[method] = handler;
                        currentNode.addChild(new TrieNode(this, part, hndlr));
                    } else {
                        // Generate empty node

                        currentNode.addChild(new TrieNode(this, part));
                    }
                    currentNode = currentNode.getChild(part);
                }
            });
        }
    }
    addRoute(path: string, method: Method, handler: HT) {
        // Set the path as a root wildcard if it is a plain star with no preceeding slash
        if(path==="*"){
            path = "_*"
        }
        path = fmtUrl(path, this.ignoreTrailingSlash);
        this._addRoute(path, method, handler);
    }

    private _find(path: string, method: Method) {        
        const [_path, querystring] = path.split("?")
        path = fmtUrl(_path, this.ignoreTrailingSlash);

        
        // Make sure that the path starts with the prefix, if not, throw a 404
        // as the request is out of the scope of the router
        if(!path.startsWith(this.prefix)){
            throw new ERR_NOT_FOUND(`Cannot ${method} /${path}`)
        }

        // Switch to absolute routing
        path = path.slice(this.prefix.length)
        const parts = path.split('/');
        
        const params:{[x:string]:string} = {}
        const query:{[x:string]:string} = this.parseQuery(querystring)
        let brk = false;
        let current = this.radixTree;
        let handler: HT|undefined;
        let wildcard: TrieNode<HT>;     
        let wildcardIndex:number=0;   
        // Add the root wildcard as the wildcard
        if(current.hasChild("_*", true)){
            wildcard=current.getChild("_*")
        }
  
        if(path === ""){
            let handler = current.getHandler(method)    

            if(!handler){
                // Check if router has a root wildcard
                if(current.hasChild("_*", true)){
                    handler = current.getChild("_*").getHandler(method)
                    
                }
                else{
                    if(!current.handlers){
                        throw new ERR_NOT_FOUND(`Cannot ${method} /${path}`)
                    }
                }
            }
            
            if(!handler)throw new ERR_METHOD_NOT_ALLOWED(`Cannot ${method} /${path}`)       
            return {handler, params, query}
        }
        parts.forEach((part, index) => {
            
            // A way to fasttrack out of the loop, forEach does not have a break feature
            if(brk)return
            
            if (current.hasChild('*', true)) {
                
                wildcard = current.getChild('*');
                wildcardIndex = index
            }

            // Templatename is the intial name that the user used for the path
            // A returned templatename means that the router has a child x
            const templateName = current.hasChild(part)
            function retWildcard(){
                brk=true                
                // The path parts traversed after the wildcard was found
                const remainingPath = parts.slice(wildcardIndex)
                
                params["*"] = remainingPath.join("/")
                let methodHandler = wildcard.handlers
                    ? wildcard.handlers[method]
                    : undefined;
                if (methodHandler) {
                    handler = methodHandler;
                } else if (wildcard.handlers && wildcard.handlers['ALL']) {
                    handler = wildcard.handlers['ALL'];
                } else {
                    
                    throw new ERR_METHOD_NOT_ALLOWED(`Cannot ${method} /${path}`);
                }
            }
            if (templateName) {
                
                // Query params start with colon
                if(templateName.startsWith(":") && !(templateName.includes("+")||templateName.includes("-"))){
                    
                    params[templateName.slice(1)]=part
                }
                else if(templateName.includes("+")||templateName.includes("-")){
                    const sections = templateName.split(/\+|\-/)
                    const reqSections = part.split(/\+|\-/)
                    if(sections.length===reqSections.length){
                        // If it starts with colon, assignment, else, check for equality, throws 404
                        sections.forEach((section, index) => {
                            const reqSection = reqSections[index]
                            if(section.startsWith(":")){
                                params[section.slice(1)] = reqSection
                            }
                            else{
                                if(section!==reqSection){
                                    throw new ERR_NOT_FOUND(`Cannot ${method} /${path}`)
                                }
                            }
                        })
                        
                    }
                }
                current = current.getChild(part);
                
                // If this is the last path part, return the handler
                if (index === parts.length - 1 && current.handlers) {
                    handler = current.getHandler(method)
                    // No handler
                    if(!handler)throw new ERR_METHOD_NOT_ALLOWED(`Cannot ${method} /${path}`)       
                }
                // If it is the last path part and no handlers are avaliable
                // Attempt to use a wildcard
                // Else, 404
                 else if (index === parts.length - 1 && !current.terminal) {
                     if(wildcard)retWildcard()
                     return
                    throw new ERR_NOT_FOUND(`Cannot ${method} /${path}`);
                } else {
                    // Proceed through the tree
                }
            } 
            // No Routes found, default to the most specific wildcard
            else if (wildcard) {
                retWildcard()

            } else {
                
                throw new ERR_NOT_FOUND(`Cannot ${method} /${path}`);
            }
        });
        if(handler){
            
            return {handler, params, query};
        }
        else{
            throw new ERR_NOT_FOUND(`Cannot ${method} /${path}`);
        }
    }

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
    find(path: string, method: Method) {
        // Debug
        // printTree(
        //     this.radixTree,
        //     (node) =>
        //         `${node.name} -- ${Object.keys(node.handlers || {}).map(
        //             (k) => k
        //         )}`,
        //     (n) => n.children
        // );
        // Get the handler
        return this._find(path, method);
    }
    // Parse the path and pull any parameters
    migrate() {
        if (!this.parentRouter) {
            throw new Error('Cannot Migrate Without a Parent Router');
        }
        const parent = this.parentRouter;
        // Traverse the Radix tree and write it to the parent router under the prefix
        const writeChildrenToPath = (node: TrieNode<HT>, prefix: string) => {
            const path = prefix + '/' + node.name;

            if (node.terminal && node.handlers) {
                for (let [method, handler] of Object.entries(node.handlers)) {
                    parent.addRoute(path, <any>method, handler);
                }
            }
            for (let child of node.children) {
                writeChildrenToPath(child, path);
            }
        };
        writeChildrenToPath(this.radixTree, '/');
    }
    private parseQuery(string:string){
        if(!string){return {}}        
        const parts = string.split("&") || [string]
        
        let query:QueryType = {}
        if(parts==[]){
            return {}
        }
        
        // Square brackets are used to denote nested types, ie user[name]=Kronsy;user[age]=23 is eqivalent to user: {name:"Kronsy",age:23} TODO: Possibly make this an opt-in feature
        parts.forEach(part => {
            if(!part){
                return
            }
            let [name, value] = part.split("=", 2)
            name = name.replaceAll("]", "")
            let parts = name.split("[")
            if(parts.length===1){
                query[parts[0]] = value
                return
            }
            else if(parts.length === 0){
                return
            }
            else{
                let context=query;
                parts.forEach((part, index) => { 
                    const isLast = index===parts.length-1
                    if(typeof context[part] === "object"){
                        if(isLast){
                            context[part]["root"] = value
                        }
                        else{
                            context = context[part]
                        }
                    }
                    else if(typeof context[part] === "string"){
                        if(isLast){
                            // Just overwrite the value
                            context[part] = value
                        }
                        else{
                            let tmp = context[part]
                            context[part] = {}
                            context[part]["root"] = tmp
                            context = context[part]
                        }
 
                    }
                    else{
                        if(isLast){
                            context[part]=value
                        }
                        else{
                            context[part] = {}
                            context = context[part]
                        }

                    }
                })
            }

        })
        return query
    }
    /**
     * Routers can have scoped child routers which write their routes to the parent under a prefix
     * @param path The Base Path of the new Router
     * @param router The Child Router Object
     */
    addSubrouter(router: Router<HT>) {
        // Initialize a Handler to wrap the subrouter
        router.parentRouter = this;
        router.migrate(); // Migrate to the parent router under the given prefix
    }
}
