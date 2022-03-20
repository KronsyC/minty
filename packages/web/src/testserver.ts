import path from "path";
import NotFound from "./core/errors/NotFound";
import Server from "./core/Server"



const app = new Server()

app.static(path.join(__dirname, "static"))

app.get("hello", async(req, res) => {
    throw new NotFound()
    return "Wassup"
})

app.listen(3000, url => {
    console.log(`Server listening at ${url}`);
})
