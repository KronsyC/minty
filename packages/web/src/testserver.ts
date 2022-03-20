import path from "path";
import Server from "./core/Server"



const app = new Server()



app.listen(3000, url => {
    console.log(`Server listening at ${url}`);
})
