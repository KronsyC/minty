
import { createServer } from "http";
import Server from "./lib/Server";


const app = new Server()

app.addRoute({
    path: "/",
    method: "GET",
    handler: async (req, res) => {
        return {
            hello: "world"
        }
    }
})


app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
    
})


// import Srv from "@mintyjs/http";


// const srv = new Srv({}, (req,res)=>{
//     res.end("Hello World")
// })

// srv.listen(3000, (host)=>{
//     console.log(`Server listening @ ${host}`);
    
// })

// const http = createServer((req, res)=>{
//     res.end("Hello World")
// })
// http.listen(3000)