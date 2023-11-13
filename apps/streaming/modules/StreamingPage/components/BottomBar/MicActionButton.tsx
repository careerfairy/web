import React from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { Mic, MicOff } from "react-feather"

export const MicActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled
         color={props.deviceOff ? "error" : undefined}
         ref={ref}
         {...props}
      >
         {props.deviceOff ? <MicOff /> : <Mic />}
      </ActionBarButtonStyled>
   )
})

MicActionButton.displayName = "MicActionButton"
