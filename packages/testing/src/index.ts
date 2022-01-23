import fastify from "fastify";

const app = fastify()


app.get("/", async(req, res) => {
    const response = 12345
    return response
})

app.listen(3000, (err)=>{
    console.log("server listening on port 3000");
    
})