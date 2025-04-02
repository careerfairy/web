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
      return DOMPurify.sanitize(htmlString)
   }, [htmlString])

   return (
      <Box
         {...boxProps}
         dangerouslySetInnerHTML={{ __html: sanitizedString }}
      />
   )
}

export default SanitizedHTML
