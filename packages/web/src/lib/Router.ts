import {Method} from "@mintyjs/http"
import printTree from "./printTree"


// Radix tree based routing based heavily off of fastify's router
class TrieNode{
    terminal:boolean; // Is this node the end of a path
    children: TrieNode[];
    handler?:Function
    value?:any;
    name:string;

    constructor(name:string, terminal:boolean, handler?:Function){
        this.children=[]
        this.name = name
        this.terminal = terminal

        if(!terminal&&handler){
            throw new Error("Cannot have handler on non-terminal node")
        }
        else if (terminal&&handler){
            this.handler = handler
        }

    }
    addChild(node:TrieNode){
        this.children.push(node)
    }
    hasChild(name:string){
        let childrenNames = this.children.map(c=>c.name)
        return childrenNames.includes(name)
    }
    getChild(name:string):TrieNode{
        for(let node of this.children){
            if(node.name===name){
                return node
            }
        }
        return this
    }
    // addHandler(method:Method, handler:any){
    //     if(this.handlers){
    //         this.handlers[method] = handler
    //     }
    //     else{
    //         const hndl:any={}
    //         hndl[method] = handler
    //         this.handlers = hndl
    //     }
    // }
}




export default class Router{
    private radixTree:TrieNode; // The root node of the tree
    constructor(config:any){
        this.radixTree = new TrieNode("root", false)
    }


    addRoute(method: Method, path:string, handler:Function ){
        
        if(path.startsWith("/")){
            path=path.slice(1)
        }
        const location = path.split("/")
        location.push(method) // Paths will look like this /foo/bar/baz/_method
        let currentNode:TrieNode=this.radixTree;
        location.forEach( (part, index) => {
            if(currentNode.hasChild(part)){
                currentNode = currentNode.getChild(part)

                // if it's the last child, set it as a terminal and add method
                if(index===location.length-1){
                    currentNode.terminal=true
                    currentNode.handler = handler
                    currentNode.value
                }
            }
            else{
                // If last part, generate terminal and add methods
                if(index===location.length-1){
                    currentNode.addChild(new TrieNode(part, true, handler))
                }
                else{
                    // Generate empty node
                    currentNode.addChild(new TrieNode(part, false))
                }
                currentNode = currentNode.getChild(part)

            }
        })
        
        printTree(
            this.radixTree,
            (node:TrieNode) => {
                if(node.handler){

                    
                    return `${node.name} -- ${node.handler()}`
                }
                return `${node.name}`
            },
            (node:any) => node.children,
          );
    }


}