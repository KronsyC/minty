
import ERR_METHOD_NOT_ALLOWED from '../errors/ERR_METHOD_NOT_ALLOWED';
import ERR_NOT_FOUND from '../errors/ERR_NOT_FOUND';
import LERR_DUPLICATE_ROUTES from '../errors/LERR_DUPLICATE_ROUTES';
import printTree from './printTree';
import TrieNode from "./TrieNode"
import { Method } from './types';

// Small utility function to trim trailing and leading slashes
function trimPath(path: string, ignoreTrailingSlash:boolean) {
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  if (path.endsWith('/')&&ignoreTrailingSlash) {
    path = path.slice(0, path.length - 1);
  }
  const parts = path.split("/")
  parts.forEach((part, index)=> {
    if(part===""){
      parts.splice(index, 1)
    }
  })
  return parts.join("/");
}
interface RouterConfig{
  ignoreTrailingSlash?:boolean;
  parameterSeparators?:string[];
  prefix?:string;
}

export default class Router<HT> {

  //#region constructor
  private radixTree: TrieNode<HT>; // The root node of the tree
  public ignoreTrailingSlash:boolean=true;
  public parameterSeparators:string[] = ["-", "+"]
  constructor(config: RouterConfig) {
    config.ignoreTrailingSlash?this.ignoreTrailingSlash=config.ignoreTrailingSlash:null
    config.parameterSeparators?this.parameterSeparators=config.parameterSeparators:null
    this.radixTree = new TrieNode(this, 'root');
    this.radixTree.rootNode=true
    this.prefix = config.prefix || "/"
  }
  //#endregion
  parentRouter?:Router<HT>
  private _prefix:string="/";
  get prefix(){
    return this._prefix
  }
  set prefix(pfix:string){
    this._prefix = pfix
    this.radixTree.name = pfix
  }
  private _addRoute(path: string, method: Method, handler: HT){
    const location = path.split('/');
    
    if(location[0]===""){
      
      this.radixTree.addHandler(method, handler)
    }
    else{
      let currentNode: TrieNode<HT> = this.radixTree;
      location.forEach((part, index) => {
        if (currentNode.hasChild(part, true)) {
          currentNode = currentNode.getChild(part);
  
          // if it's the last child, set it as a terminal and add method
          if (index === location.length - 1) {
            currentNode.terminal = true;
            if(currentNode.handlers){
              if(!currentNode.handlers[method]){
                currentNode.handlers[method] = handler
              }
              else{
                throw new LERR_DUPLICATE_ROUTES(`Duplicate Handlers registered for ${method} ${path}`)
              }
            }
            else{
              let hndlr:any = {}
              hndlr[method]=handler
              currentNode.handlers = hndlr
            }
          }
        } 
        else {
          // If last part, generate terminal and add methods
          if (index === location.length - 1) {
            let hndlr:any={}
            hndlr[method]=handler
            currentNode.addChild(new TrieNode(this, part, hndlr));
          } else {
            // Generate empty node
  
            currentNode.addChild(new TrieNode(this,part));
          }
          currentNode = currentNode.getChild(part);
        }
      });
    }

  }
  addRoute(path: string, method: Method, handler: HT) {
    path = trimPath(path, this.ignoreTrailingSlash);
    this._addRoute(path, method, handler)
  }

  private _find(path:string, method:Method):HT{

    path = trimPath(path, this.ignoreTrailingSlash)
    const parts = path.split('/');

    let current = this.radixTree;
    let handler: any;
    let wildcard:TrieNode<any>;
    parts.forEach((part, index) => {
        
      if(current.hasChild("*")){
        wildcard=current.getChild("*")
      }

      if (current.hasChild(part)) {        
        current = current.getChild(part);
        
        // If this is the last path part, return the handler
        if (index === parts.length - 1 && current.handlers) {
          
            let methodHandler = current.handlers[method]
            if(methodHandler){
              
              handler=methodHandler
            }
            else if (current.handlers["ALL"]){
              handler=current.handlers["ALL"]
            }
            else{
              throw new ERR_METHOD_NOT_ALLOWED()
            }
        }
        else if(index===parts.length-1&&!current.terminal){
          throw new ERR_NOT_FOUND()
        }
        else{
          // Do Nothing
        }
      }
      else if (wildcard){
        
        let methodHandler = wildcard.handlers?wildcard.handlers[method]:undefined
        if(methodHandler){
          handler=methodHandler
        }
        else if (wildcard.handlers&&wildcard.handlers["ALL"]){
          handler=wildcard.handlers["ALL"]
        }
        else{
          throw new ERR_METHOD_NOT_ALLOWED()
        }
      }
      else {
        throw new ERR_NOT_FOUND()
        
      }
    });
    return handler;
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
  find(path: string, method: Method) : HT {
    printTree(
      this.radixTree,
      node=> `${node.name} -- ${Object.keys(node.handlers||{}).map(k=>k)}`,
      n=>n.children
      )
    const handler = this._find(path, method)
      return handler
  }
  migrate(){
    if(!this.parentRouter){
      throw new Error("Cannot Migrate Without a Parent Router")
    }
    const parent = this.parentRouter
    // Traverse the Radix tree and write it to the parent router under the prefix
    const writeChildrenToPath = (node:TrieNode<HT>, prefix:string) => {
      const path = prefix+"/" + node.name
      
      if(node.terminal && node.handlers){
        
        
        for( let [method, handler] of Object.entries(node.handlers)){
          parent.addRoute(path, <any>method, handler)
        }
      }
      for(let child of node.children){
        writeChildrenToPath(child, path)
      }
    }
    writeChildrenToPath(this.radixTree, "/")
  }
  /**
   * Routers can have scoped child routers which write their routes to the parent under a prefix
   * @param path The Base Path of the new Router
   * @param router The Child Router Object
   */
  addSubrouter(router:Router<HT>){
    // Initialize a Handler to wrap the subrouter
    router.parentRouter = this
    router.migrate() // Migrate to the parent router under the given prefix
  }
}
