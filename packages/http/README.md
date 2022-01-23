# Minty HTTP

### A lightweight web library that abstracts away the http libraries into a uniform interface

## Features

- Typescript-first
- Out of the Box HTTP2 support
- Low Overhead

## Installation

- ### yarn

  ```bash
  yarn add @mintyjs/http
  ```

- ### npm

  ```bash
  npm install @mintyjs/http
  ```

## Example (Typescript)

```typescript
import Server, { Request, Response } from "@mintyjs/http"

function listener(req: Request, res: Response){
    res.end("Hello World!")  
}

const app = new Server({}, listener)

app.listen(3000, (url) => {
    console.log(`Server listening at ${url}`)
})

```

## Example (Javascript)

```typescript
const Server = require("@mintyjs/http")

function listener(req, res){
    res.end("Hello World!")  
}

const app = new Server({}, listener)

app.listen(3000, (url) => {
    console.log(`Server listening at ${url}`)
})

```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
