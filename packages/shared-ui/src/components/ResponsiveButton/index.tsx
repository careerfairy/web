import { Button, ButtonProps, useTheme, useMediaQuery } from "@mui/material"
import { forwardRef } from "react"

export type ResponsiveButtonProps = ButtonProps

export const ResponsiveButton = forwardRef<
   HTMLButtonElement,
   ResponsiveButtonProps
>((props, ref) => {
   const theme = useTheme()
   const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
   return (
      <Button ref={ref} size={isSmallScreen ? "small" : "medium"} {...props}>
         {props.children}
      </Button>
   )
})
