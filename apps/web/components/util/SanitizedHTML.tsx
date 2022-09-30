import * as DOMPurify from "dompurify"
import { useMemo } from "react"

/**
 * Render unsafe html strings coming from the server
 *
 * We use DOM Purify to strip possible xss attack vectors
 * @param htmlString
 * @constructor
 */
const SanitizedHTML = ({ htmlString }) => {
   const sanitizedString = useMemo(() => {
      return DOMPurify.sanitize(htmlString)
   }, [htmlString])

   return <div dangerouslySetInnerHTML={{ __html: sanitizedString }} />
}

export default SanitizedHTML
