import { Method } from '@mintyjs/http';
import ERR_METHOD_NOT_ALLOWED from '../errors/ERR_METHOD_NOT_ALLOWED';
import ERR_NOT_FOUND from '../errors/ERR_NOT_FOUND';
import printTree from './printTree';


// Small utility function to trim trailing and leading slashes
function trimPath(path: string, ignoreTrailingSlash:boolean) {
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  if (path.endsWith('/')&&ignoreTrailingSlash) {
    path = path.slice(0, path.length - 1);
  }
  return path;
}

interface RouterConfig{
  ignoreTrailingSlash?:boolean;
  parameterSeparators?:string[]
}
interface PathHandlers<HT>{
  GET?:HT
  POST?:HT
  PUT?:HT
  DELETE?:HT
  PATCH?:HT
  OPTIONS?:HT
  TRACE?:HT
  HEAD?:HT
  CONNECT?:HT
  ALL?:HT
}

// Radix tree based routing
class TrieNode <HT> {
  terminal: boolean; // Is this node the end of a path
  children: TrieNode<HT>[];
  handlers?: PathHandlers<HT>;
  value?: any;
  name: string;
  router:Router<HT>

  /**
   * 
   * @param router An Instance of a Router
   * @param name The Name of the route segment
   * @param handlers An Object Representing the mappings of HTTP methods to The Chosen Handler Type
   */
  constructor(router:Router<HT>, name: string, handlers?: PathHandlers<HT>) {
    this.router=router    
    this.children = [];
    this.name = name;

    if(handlers){
      this.terminal=true
      this.handlers=handlers
    }
    else{
      this.terminal=false
    }
  }
  private extractPath(path: string): string[] {
    let list = [];
    let tmp: string = '';
    for (let char of path) {
      if (this.router["parameterSeparators"].includes(char)) {
        list.push(tmp);
        list.push(char);
        tmp = '';
      } else {
        tmp += char;
      }
    }
    if (tmp) {
      list.push(tmp);
    }
    return list;
  }
  private routePartsMatch(
    routeParts: string[],
    templateParts: string[]
  ): boolean {
    if (routeParts.length === templateParts.length) {
      for (let i = 0; i < routeParts.length; i++) {
        let routePart = routeParts[i];
        let templatePart = templateParts[i];

        if (!templatePart.startsWith(':') && routePart !== templatePart) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true
  }
  private isMatch(route: string, template: string): boolean {
    // Check if two route segments match
    if(!this.router["parameterSeparators"].map(s=>template.includes(s)).includes(true)) {
      
      if (template.startsWith(':')) {
        return true;
      }
    } else {
      const routeParts = this.extractPath(route);
      const templateParts = this.extractPath(template);

      let matches = this.routePartsMatch(routeParts, templateParts);

      return matches;
    }

    return false;
  }
  addChild(node: TrieNode<HT>) {
    this.children.push(node);
  }
  /**
   * 
   * @param name 
   * @param exact This parameter prevents pattern matching
   * @returns 
   */
  hasChild(name: string, exact:boolean=false) {
    let childrenNames = this.children.map((c) => c.name);

    if(childrenNames.includes(name)){
      return true
    }
    for (const template of childrenNames) {
      // Only operate on dynamic paths
      if (template.includes(':') && !exact) {
          const matches = this.isMatch(name, template);
          if (matches) {
            return true;
        }
      }
    }
    return false
  }
  getChild(name: string): TrieNode<HT> {
      // Moves catchall routes to the end of the array, i.e lowest priority
      for(const child of this.children){
        if(!(child.name.includes("+")||child.name.includes("-")) && child.name.startsWith(":")){
          const e = this.children.splice(this.children.indexOf(child), 1)[0]
          this.children.push(e)
        }
      }

      const childrenNames = this.children.map((c) => c.name);
      if (childrenNames.includes(name)) {
        for (const child of this.children) {
          if (child.name === name) {
            return child;
          }
        }
      } else {
        for (const child of this.children) {
          if (child.name.includes(':')) {
            const doRoutesMatch = this.isMatch(name, child.name);
            if (doRoutesMatch) {

              return child;
            }
          }
        }
      }
                return this;

  }
  hasTerminalChild() {
    let childNames = this.children.map((c) => c.terminal);
    return childNames.includes(true);
  }
}



export default class Router<HT> {

  private radixTree: TrieNode<HT>; // The root node of the tree
  private ignoreTrailingSlash:boolean=true;
  private parameterSeparators:string[] = ["-", "+"]
  constructor(config: RouterConfig) {
    config.ignoreTrailingSlash?this.ignoreTrailingSlash=config.ignoreTrailingSlash:null
    config.parameterSeparators?this.parameterSeparators=config.parameterSeparators:null

    this.radixTree = new TrieNode(this, 'root');
  }

  addRoute(path: string, method: Method, handler: HT) {
    path = trimPath(path, this.ignoreTrailingSlash);
    const location = path.split('/');

    let currentNode: TrieNode<HT> = this.radixTree;
    location.forEach((part, index) => {
      if (currentNode.hasChild(part, true)) {
        currentNode = currentNode.getChild(part);

        // if it's the last child, set it as a terminal and add method
        if (index === location.length - 1) {
          currentNode.terminal = true;
          if(currentNode.handlers){
            currentNode.handlers[method] = handler
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

  /**
   *
   * @description Gets the handler associated with an action
   * @summary
   * Takes a path and method, and returns a handler
   * - Throws ERR_METHOD_NOT_ALLOWED if the route does not support the specified method
   * - Throws ERR_NOT_FOUND if the route doesn't have any handlers
   *
   * @param path The path you want to fetch a handler for
   * @param method The HTTP method of the route
   *
   */
  find(path: string, method: Method) : HT {
    printTree(
      this.radixTree,
      n => n.name.toUpperCase(),
      n=> n.children
    )
    path = trimPath(path, this.ignoreTrailingSlash)
    const parts = path.split('/');

    let current = this.radixTree;
    let handler: any;
    let wildcard:TrieNode<HT>;
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
}
