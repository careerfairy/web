import { Box } from "@mui/material"
import { FC } from "react"

const smallPadding = 1
const largePadding = 2
// @ts-ignore
const WidgetsWrapper: FC<{
   children: React.ReactNode
}> = ({ children }) => (
   <Box
      sx={(theme) => ({
         py: { xs: smallPadding, sm: largePadding },
         "& > *:not(:first-of-type)": {
            pt: {
               xs: smallPadding,
               sm: smallPadding,
            },
         },
      })}
   >
      {children}
   </Box>
)

// @ts-ignore
export default WidgetsWrapper
