import { Video, VideoOff } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { forwardRef, useState } from "react"
import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   off: {
      "& svg": {
         color: "error.main",
      },
   },
})

export const VideoActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const [deviceOff, setDeviceOff] = useState<boolean>(false)

   const handleClick = () => {
      setDeviceOff(!deviceOff)
   }

   return (
      <ActionBarButtonStyled
         color={deviceOff ? "error" : undefined}
         ref={ref}
         onClick={handleClick}
         sx={deviceOff ? styles.off : undefined}
         {...props}
      >
         {deviceOff ? <VideoOff /> : <Video />}
      </ActionBarButtonStyled>
   )
})

VideoActionButton.displayName = "VideoActionButton"
