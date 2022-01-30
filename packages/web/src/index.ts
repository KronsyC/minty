import Server from "./lib/Server";
import Plugin from "./lib/util/Plugin";
class Headers extends Plugin{

    override preLoad(): void {
        this.prefix = "headers"
    }
    override register(): void {
        console.log("Registering Headers plugin");
        this.get("/", async(req, res)=>{
            res.send(req.headers)
        })

        this.post("/", async(req, res)=>{
            return "Create Headers"
        })
        this.get("/:name", async(req, res)=>{
            return "Get Headers by name"
        })
    }
    
}
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

app.addPlugin(Headers)
app.addPlugin(API)

app.get("/", async (req, res)=>{
    res.status(200)
    .send("Homepage")
})
app.get("/users", async(req, res)=> {
    res.status(200)
    .send("Get All Users")
})
app.post("/users", async(req, res)=> {
    res.status(200)
    .send("Create user")
})


app.listen(3000, "0.0.0.0", (url)=>{
    console.log(`Server listening at ${url}`);
})