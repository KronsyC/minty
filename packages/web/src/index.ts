import Server from "./core/Server";

const app = new Server()

interface CreateUserBody{
    username: string;
    email: string;
    password: string;
}

app.use(
    // API plugin
    function(app, options, done) {
    app.get("/", async(req, res) => {
        return "Base API route"
    })

    app.get("users/:userid", async(req, res) => {
        return `Getting user ${(req.params as any).userid}`
    })
    app.post<CreateUserBody>("/users",{
        schemas: {
            body: {
                type: "object",
                required: "all",
                properties: {
                    username: "string",
                    email: "string",
                    password: "string"
                }
            }
        }
    }, async(req, res) => {
        return {
            statusCode: 201,
            message: "Successfully Created User",
            data: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            }
        }
    })

}, {prefix: "/api"})




app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})