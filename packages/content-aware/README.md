# @mintyjs/content-aware

## Serialize and get the MIME type of any data

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
