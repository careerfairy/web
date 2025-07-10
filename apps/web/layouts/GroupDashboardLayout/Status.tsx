import { Box } from "@mui/material"
import { styled, useTheme } from "@mui/styles"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"

const StatusIcon = styled(Box)(({ theme }) => ({
   width: theme.spacing(2),
   height: theme.spacing(2),
   borderRadius: "50%",
   boxShadow: "inset 0 0 0 3.5px white",
}))

type StatusProps = {
   message: string
   color: "primary" | "secondary" | "success" | "error" | "warning" | "info"
}

export const Status = ({ color, message }: StatusProps) => {
   const theme = useTheme()
   const targetColor = theme.palette[color].main

   return (
      <BrandedTooltip arrow title={message}>
         <StatusIcon
            bgcolor={targetColor}
            border={`1px solid ${targetColor}`}
         />
      </BrandedTooltip>
   )
}
