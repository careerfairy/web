import { Tooltip } from "@mui/material"
import { AgoraRTCReactError } from "agora-rtc-react"
import useMenuState from "components/custom-hook/useMenuState"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { forwardRef } from "react"
import { Airplay } from "react-feather"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { useScreenShare } from "../../context/ScreenShare"
import { getDeviceButtonColor, getRTCErrorCode } from "../../util"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ShareMenu } from "../ShareMenu"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"
import { StopSharingButton } from "./StopSharingButton"

export const ShareActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { anchorEl, handleClick, open, handleClose } = useMenuState()
   const { screenShareError, isLoadingScreenShare } = useScreenShare()

   const isSpotlightMode = useIsSpotlightMode()

   if (isSpotlightMode) {
      return <StopSharingButton enableTooltip {...props} />
   }

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
               <BrandedTooltip
                  title={enableTooltip ? ActionTooltips.Share : null}
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
               </BrandedTooltip>
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

   // if you cancel screen share 3 times on safari, the browser will block black access to ALL DEVICES until you restart the browser
   const userCancelledScreenShareSafari =
      error.message ===
      "AgoraRTCError PERMISSION_DENIED: NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission."

   const macSystemPermissionDenied =
      code === "PERMISSION_DENIED" &&
      message.includes("permission denied by system")

   const windowsSystemPermissionDenied =
      code === "NOT_READABLE" &&
      message.includes("could not start video source")

   if (userCancelledScreenShareSafari) {
      return "Screen share denied. If issues persist, adjust Safari's Screen Sharing settings under Websites > Screen Sharing."
   }

   if (
      macSystemPermissionDenied ||
      windowsSystemPermissionDenied ||
      code === "DEVICE_NOT_FOUND"
   ) {
      return "Screen share permission denied. Please enable it in your system settings."
   }

   return "An unexpected error occurred during screen sharing. Please check your connection and permissions, then try again."
}
ShareActionButton.displayName = "ShareActionButton"
