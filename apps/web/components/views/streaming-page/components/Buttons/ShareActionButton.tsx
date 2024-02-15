import { forwardRef } from "react"
import { Airplay } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import useMenuState from "components/custom-hook/useMenuState"
import { ShareMenu } from "../ShareMenu"
import { Tooltip } from "@mui/material"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useScreenShare } from "../../context/ScreenShareTracks"
import { getDeviceButtonColor, getRTCErrorCode } from "../../util"
import { AgoraRTCReactError } from "agora-rtc-react"

export const ShareActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { anchorEl, handleClick, open, handleClose } = useMenuState()
   const { screenShareError, isLoadingScreenShare } = useScreenShare()

   return (
      <span>
         <Tooltip
            placement="top"
            title={getScreenShareErrorMessage(screenShareError)}
         >
            <BrandedBadge
               color="warning"
               badgeContent={screenShareError ? "!" : undefined}
            >
               <ActionBarButtonStyled
                  color={getDeviceButtonColor(
                     true,
                     isLoadingScreenShare,
                     screenShareError
                  )}
                  active={open}
                  disabled={isLoadingScreenShare}
                  ref={ref}
                  {...props}
                  onClick={handleClick}
               >
                  <Airplay />
               </ActionBarButtonStyled>
            </BrandedBadge>
         </Tooltip>
         <ShareMenu open={open} anchorEl={anchorEl} handleClose={handleClose} />
      </span>
   )
})

const getScreenShareErrorMessage = (error: AgoraRTCReactError) => {
   if (!error) {
      return ""
   }
   const message = error.message.toLocaleLowerCase()
   const code = getRTCErrorCode(error)

   const macSystemPermissionDenied =
      code === "PERMISSION_DENIED" &&
      message.includes("permission denied by system")

   const windowsSystemPermissionDenied =
      code === "NOT_READABLE" &&
      message.includes("could not start video source")

   if (
      macSystemPermissionDenied ||
      windowsSystemPermissionDenied ||
      code === "DEVICE_NOT_FOUND"
   ) {
      return "Screen share permission denied. Please enable it in your system settings."
   }

   return "Some error occurred with the screen share."
}
ShareActionButton.displayName = "ShareActionButton"
