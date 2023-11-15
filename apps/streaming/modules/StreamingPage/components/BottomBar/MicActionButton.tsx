import { forwardRef, useState } from "react"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { Mic, MicOff } from "react-feather"
import { sxStyles } from "@careerfairy/shared-ui"

const styles = sxStyles({
   off: {
      "& svg": {
         color: "error.main",
      },
   },
})

export const MicActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
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
            {deviceOff ? <MicOff /> : <Mic />}
         </ActionBarButtonStyled>
      )
   }
)

MicActionButton.displayName = "MicActionButton"
