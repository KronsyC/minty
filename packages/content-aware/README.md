# @mintyjs/content-aware

> TODO: description

## Usage

```typescript
import contentAware from "@mintyjs/content-aware"

const data = {
    hello: "World"
}
const schema = {
    type: "object",
    properties: {
        hello: {
            type: "string"
        }
    }
}

const [response, contentType] = contentAware(data, schema)

console.log(response) // `{"hello":"World"}`
console.log(contentType) // `application/json`

```
