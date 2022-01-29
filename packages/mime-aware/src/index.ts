import memoize from "memoizee"

import contentAwareSerialize from "./lib/mimeAware";
import { getContentType } from "./lib/mimeAware";

export {getContentType}
export default memoize(contentAwareSerialize)
