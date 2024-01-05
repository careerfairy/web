import { FC } from "react"
import { Stack, SxProps } from "@mui/material"

type ChartSwitchButtonGroupContainerProps = {
   children: React.ReactNode
   sx?: SxProps
}

const ChartSwitchButtonGroupContainer: FC<
   ChartSwitchButtonGroupContainerProps
> = ({ children, sx }) => {
   return (
      <Stack direction="row" spacing={1.5} sx={sx}>
         {children}
      </Stack>
   )
}

export default ChartSwitchButtonGroupContainer
