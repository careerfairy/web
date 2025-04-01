import Box, { BoxProps } from "@mui/material/Box"
import DOMPurify from "isomorphic-dompurify"
import { FC, useMemo } from "react"

type Props = Omit<BoxProps, "dangerouslySetInnerHTML"> & {
   htmlString: string
}

/**
 * Render unsafe html strings coming from the server
 *
 * We use DOM Purify to strip possible xss attack vectors
 * @param htmlString
 * @param boxProps
 * @constructor
 */
const SanitizedHTML: FC<Props> = ({ htmlString, ...boxProps }) => {
   const sanitizedString = useMemo(() => {
      const sanitized = DOMPurify.sanitize(htmlString)

      // Then clean up consecutive <p> tags and empty paragraphs
      return sanitized
         .replace(/<p>\s*<br>\s*<\/p>/g, "") // Remove paragraphs that only contain <br>
         .replace(/<p>\s*<\/p>/g, "") // Remove empty paragraphs
         .replace(/(<\/p>\s*<p>)+/g, "</p><p>") // Collapse multiple p tag pairs into one
   }, [htmlString])

   return (
      <Box
         {...boxProps}
         dangerouslySetInnerHTML={{ __html: sanitizedString }}
      />
   )
}

export default SanitizedHTML
