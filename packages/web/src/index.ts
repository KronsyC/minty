import Server from "./lib/Server"


const app = new Server()




app.listen(3000, (url)=>{
    console.log(`Server listening at ${url}`);
    
})
