import Server from "./lib/Server"


const app = new Server()

app.addRoute({
    path: "/",
    method: "GET",
    handler: async () => "hello world"
})


app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
    
})
