import Server from "./core/Server";
import path from "node:path"
const app = new Server({
    poweredByHeader: false
})

interface CreateUserBody{
    username: string;
    email: string;
    password: string;
}
interface GetUserParams{
    userid: number
}

app.use((app, options, done) => {
    app.get("/", async(req, res) => {
        return "Base API route"
    })

    app.get<any, GetUserParams>("users/:userid", {
        schemas: {
            response: {
                "2xx": {
                    type: "object",
                    required: "all",
                    properties: {
                        statusCode: "number",
                        message: "string",
                        userid: "number"
                    },
                    strict: true
                }
            },
            params: {
                type: "object",
                properties: {
                    userid: "number"
                }
            }
        }
    }, async(req, res) => {
        return {
            statusCode: 200,
            message: "Successfully fetched User",
            userid: req.params.userid
        }
    })
    done()
}, {prefix: "/api"})

app.get("/brew", async(req, res )=> {
    res.status(418)
    return `
    I'm a little teapot,
    Short and stout,
    Here is my handle
    Here is my spout
    When I get all steamed up,
    Hear me shout,
    Tip me over and pour me out!
    
    I'm a very special teapot,
    Yes, it's true,
    Here's an example of what I can do,
    I can turn my handle into a spout,
    Tip me over and pour me out!`
})

app.get("/discord", async(req, res) => {
    res.redirect("https://discord.gg/AFB9HaRG")
})


app.static(path.join(__dirname, "static"))

app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})