import path from "path";
import Server from "./core/Server";
import Plugin from "./lib/util/Plugin";

class API extends Plugin{
    override preLoad(): void {
        this.prefix = "api"
    }
    override register(): void {
        this.get("/", async(req, res)=>{
            res.send("API Plugin")
        })

    }
}

const app = new Server()
app.addPlugin(API)

app.get("/", async function(req, res){
    console.log(`Incoming Request from ${req.source.ip}:${req.source.port} -- http/${req.httpVersion}`);
    res.status(200)
    .sendFile(path.join(__dirname, "assets", "index.html"))
})
app.get("favicon.ico", async(req, res)=>{
    res.status(200).sendFile(path.join(__dirname, "assets", "favicon.ico"))
})

app.get("/users/:userid", async(req, res)=>{
    return `Fetching data for user ${(<any>req.params).userid}`
})
app.get("/users/me", async(req, res)=>{
    return "Get current user"
})
app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})
