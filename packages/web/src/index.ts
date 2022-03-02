import Server from "./core/Server";

const app = new Server()

app.get("/", async(req, res) => {
    return "Homepage"
})




app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})