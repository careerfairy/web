import { FC } from "react"
import { Stack } from "@mui/material"

type ChartSwitchButtonGroupContainerProps = {
   children: React.ReactNode
}

const ChartSwitchButtonGroupContainer: FC<
   ChartSwitchButtonGroupContainerProps
> = ({ children }) => {
   return (
      <Stack direction="row" spacing={1.5}>
         {children}
      </Stack>
   )
}

export default ChartSwitchButtonGroupContainer
