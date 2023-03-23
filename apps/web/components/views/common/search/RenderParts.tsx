import React, { FC } from "react"
import { Box } from "@mui/material"
import { getParts } from "../../../util/search"

type Matches = ReturnType<typeof getParts>

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
