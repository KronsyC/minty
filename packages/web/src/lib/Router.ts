import {Method} from "@mintyjs/http"
import findMyWay from "find-my-way"

class Route{
    constructor(
        public method:Method,
        public path:string
    ){}
}


export default class Router{
    private routes:Route[]=[]
    constructor(){

    }


    addRoute(method: Method, route:string ){
        this.routes.push(new Route(method, route))
    }
}