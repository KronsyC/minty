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
app.on("routeRegister", (metadata, done) => {
    console.log(`Registering ${metadata.method} ${metadata.path}`);
    done()
})
app.use((app, options, done) => {
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
            userid: req.params.userid,
            authorization: "xxxxxxx.xxxxxxxxxxxxxx.xxxxxxx"
        }
    })
    done()
}, {prefix: "/api"})


app.static(path.join(__dirname, "static"), {
    prefix: "/static",
    defaultHeaders: {
        "X-Hello": "World"
    }
})

app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})