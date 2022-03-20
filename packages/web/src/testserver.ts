import path from "path";
import Server from "./core/Server"



const app = new Server()

app.intercept("response", (req, res, done) => {
    done()
    
})
app.get("/hello", async(req, res) => {
    res.redirect("/world")
})
app.get("/world", async(req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"))
})
app.setNotFoundHandler(async(req, res) => {
    res.sendFile(path.join(__dirname, "static", "404.html"))
})

app.get("/", async(req, res) => {
    res.cookie("test", "HelloWorld!", {httpOnly: true, secure: true, maxAge:60, sameSite:"lax"})
    .send("Hello!")
})
app.listen(3000, url => {
    console.log(`Server listening at ${url}`);
})
