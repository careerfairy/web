import { Button, ButtonProps } from "@mui/material"
import { forwardRef } from "react"
import { useIsMobile } from "../../"

export type ResponsiveButtonProps = ButtonProps

export const ResponsiveButton = forwardRef<
   HTMLButtonElement,
   ResponsiveButtonProps
>((props, ref) => {
   const isMobile = useIsMobile()

   return (
      <Button ref={ref} size={isMobile ? "small" : "medium"} {...props}>
         {props.children}
      </Button>
   )
})
