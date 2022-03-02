import path from "path";
import Server from "./core/Server";

const app = new Server()

app.post("/", {
    schemas: {
        body: {
            type: "object",
            required: ["name", "age"],
            properties: {
                age: {
                    type: "number",
                    min: 18,
                    max: 150
                },
                name: {
                    type: "string",
                    minLength: 3,
                    maxLength: 42
                },

            },
            strict: true
        }
    }
}, async(req, res) => {
    return `Your name is ${req.body.name} and you are ${req.body.age} years old`
})




app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
})