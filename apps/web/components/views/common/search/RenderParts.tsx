import React, { FC } from "react"
import { Box } from "@mui/material"
import { getParts } from "../../../util/search"

type Matches = ReturnType<typeof getParts>

/**
 * Renders a list of search result parts with highlighted matches
 *
 * @param {Object} props - Component props
 * @param {Array} props.parts - List of search result parts with highlight information
 * @returns {JSX.Element} - Rendered list of search result parts wrapped in React Fragment
 */
const RenderParts: FC<{ parts: Matches }> = ({ parts }) => {
   return (
      <>
         {parts.map((part, index) => (
            <Box
               key={index}
               component="span"
               fontWeight={part.highlight ? "bold" : "regular"}
            >
               {part.text}
            </Box>
         ))}
      </>
   )
}
export default RenderParts
