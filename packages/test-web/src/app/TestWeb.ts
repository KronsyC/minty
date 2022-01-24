import Server from "@mintyjs/web";

const app = new Server()

app.listen(3000, (host)=> {
  console.log(`Server listening at ${host}`);
  
})
