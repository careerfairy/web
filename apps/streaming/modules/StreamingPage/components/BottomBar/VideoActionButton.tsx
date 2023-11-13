import { Video, VideoOff } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import React from "react"

export const VideoActionButton = React.forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   return (
      <ActionBarButtonStyled
         color={props.deviceOff ? "error" : undefined}
         ref={ref}
         {...props}
      >
         {props.deviceOff ? <VideoOff /> : <Video />}
      </ActionBarButtonStyled>
   )
})

VideoActionButton.displayName = "VideoActionButton"
