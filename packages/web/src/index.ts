import Server from "./core/Server";
import path from "node:path"
import fs from "node:fs"
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
    app.setNotFoundHandler(async(req, res) => {
        return "api not found OwO"
    })
    app.get("/", async(req, res) => {
        return "Base API route"
    })

    app.get<any, GetUserParams>("users/:userid", {
        schemas: {
            response: {
                "2xx": {
                    type: "object",
                    required: ["statusCode", "message", "userid"],
                    properties: {
                        statusCode: "number",
                        message: "string",
                        userid: "number",
                        authorization: "any"
                    },
                    strict: true
                }
            },
            params: {
                type: "object",
                required: "all",
                properties: {
                    userid: "number"
                },
                strict: true
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

app.setNotFoundHandler(async(req, res) => {
    return "Not Found UwU"
})
app.static(path.join(__dirname, "static"), {
    prefix: "/static",
    defaultHeaders: {
        "X-Hello": "World"
    }
})

app.get("/", async(req, res) => {
    res.redirect("discord")
})
app.post("/", async(req, res) => {
    return req.headers
})

app.listen(3000, url=>{
    console.log(`Server listening at ${url}`);
})