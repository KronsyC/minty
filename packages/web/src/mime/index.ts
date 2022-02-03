import memoize from "memoizee"

import contentAwareSerialize from "./mimeAware";
import { getContentType } from "./mimeAware";

export {getContentType}
export default memoize(contentAwareSerialize, {
    primitive:true
})
