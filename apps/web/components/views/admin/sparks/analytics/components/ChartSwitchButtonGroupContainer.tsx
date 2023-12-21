import { FC } from "react"
import { Box } from "@mui/material"

type ChartSwitchButtonGroupContainerProps = {
   children: React.ReactNode
}

const ChartSwitchButtonGroupContainer: FC<
   ChartSwitchButtonGroupContainerProps
> = ({ children }) => {
   return (
      <Box
         sx={{
            display: {
               xs: "none",
               md: "flex",
            },
            gap: 1.5,
         }}
      >
         {children}
      </Box>
   )
}

export default ChartSwitchButtonGroupContainer
