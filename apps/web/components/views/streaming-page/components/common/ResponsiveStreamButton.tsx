import { Button, ButtonProps } from "@mui/material"
import { forwardRef } from "react"
import { useStreamIsMobile } from "components/custom-hook/streaming"

export type ResponsiveButtonProps = ButtonProps

export const ResponsiveStreamButton = forwardRef<
   HTMLButtonElement,
   ResponsiveButtonProps
>((props, ref) => {
   const isMobile = useStreamIsMobile()

   return (
      <Button ref={ref} size={isMobile ? "small" : "medium"} {...props}>
         {props.children}
      </Button>
   )
})

ResponsiveStreamButton.displayName = "ResponsiveStreamButton"
