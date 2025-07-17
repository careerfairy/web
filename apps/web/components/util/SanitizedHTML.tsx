import Box, { BoxProps } from "@mui/material/Box"
import DOMPurify from "isomorphic-dompurify"
import { FC, useMemo } from "react"

type Props = Omit<BoxProps, "dangerouslySetInnerHTML"> & {
   htmlString: string
   openLinksInNewTab?: boolean
}

/**
 * Render unsafe html strings coming from the server
 *
 * We use DOM Purify to strip possible xss attack vectors
 * @param htmlString
 * @param boxProps
 * @constructor
 */
const SanitizedHTML: FC<Props> = ({
   htmlString,
   openLinksInNewTab,
   ...boxProps
}) => {
   const sanitizedString = useMemo(() => {
      if (openLinksInNewTab) {
         // Use DOMPurify's hook system to safely transform anchor tags
         DOMPurify.addHook("afterSanitizeAttributes", (node) => {
            // Only process anchor tags
            if (node.tagName === "A") {
               // Set target to open in new tab
               node.setAttribute("target", "_blank")

               // Add security attributes to prevent potential attacks (window.opener)
               // when you open a link with target="_blank",the new window gets access to the original window through window.opener
               const existingRel = node.getAttribute("rel") || ""
               const relValues = existingRel.split(/\s+/).filter(Boolean)

               // Ensure noopener and noreferrer are present
               if (!relValues.includes("noopener")) {
                  relValues.push("noopener")
               }
               if (!relValues.includes("noreferrer")) {
                  relValues.push("noreferrer")
               }

               node.setAttribute("rel", relValues.join(" "))
            }
         })
      }

      const sanitized = DOMPurify.sanitize(htmlString)

      // Clean up the hook to prevent memory leaks
      if (openLinksInNewTab) {
         DOMPurify.removeHook("afterSanitizeAttributes")
      }

      return sanitized
   }, [htmlString, openLinksInNewTab])

   return (
      <Box
         {...boxProps}
         dangerouslySetInnerHTML={{ __html: sanitizedString }}
      />
   )
}

export default SanitizedHTML
