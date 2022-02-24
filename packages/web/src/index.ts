import path from "path";
import Server from "./core/Server";

const app = new Server()

app.get("/", {
    schemas: {
        response: {
            "4xx": {
                type: "object",
                properties: {
                    statusCode: "number",
                    error: "string",
                    message: "string"
                }
            }
        }
    }
}, async(req, res)=> {
    console.log("HEY");
    
    return "WASSUP"
})
app.post("/users", async(req, res) => {
    return "Create User"
})
app.put("/users/:id-wassup", async(req, res) => {
    return req.params
})
app.delete("/users/:id", async(req, res) => {
    return `Delete user ${req.params["id"]}`
})




app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})