import Server from "./lib/Server"


const app = new Server()


app.listen(3000, host => {
    console.log(`Server listening at ${host}`);
    
})