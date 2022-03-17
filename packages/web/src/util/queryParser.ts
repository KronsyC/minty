import { Querystring } from './../core/types';


export function parseQuery(string:string){
    if(!string){return {}}        
    const parts = string.split("&") || [string]
    
    let query:Querystring = {}
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