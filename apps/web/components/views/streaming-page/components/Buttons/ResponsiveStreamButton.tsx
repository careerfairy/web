import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { forwardRef } from "react"

export type ResponsiveButtonProps = LoadingButtonProps

export const ResponsiveStreamButton = forwardRef<
   HTMLButtonElement,
   ResponsiveButtonProps
>((props, ref) => {
   const isMobile = useStreamIsMobile()

   return (
      <LoadingButton ref={ref} size={isMobile ? "small" : "medium"} {...props}>
         {props.children}
      </LoadingButton>
   )
})

ResponsiveStreamButton.displayName = "ResponsiveStreamButton"
