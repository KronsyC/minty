import Server from "./lib/Server";
import Plugin from "./lib/util/Plugin";
class ResponseTime extends Plugin{
    constructor(){
        super({
            prefix: "/api/headers"
        })
    }

    override register(): void {
        this.get("/", async(req, res) => {
            res.send(req.headers)
        })
    }
    
}

const app = new Server()

app.addPlugin(ResponseTime)

app.get("/", async (req, res)=>{
    res.status(200)
    .send("Hello World")
})
app.get("/users", async(req, res)=> {
    res.status(200)
    .send("Get All Users")
})

app.get("/api/*", async(req, res)=>{
    res.status(200).send("API")
})
app.get("/api/abc/*", async(req, res)=>{
    res.status(200).send("API abc")
})

app.listen(3000, "0.0.0.0", (url)=>{
    console.log(`Server listening at ${url}`);
})