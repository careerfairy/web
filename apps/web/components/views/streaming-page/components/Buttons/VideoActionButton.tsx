import { Video, VideoOff } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context/LocalTracks"
import { Tooltip } from "@mui/material"
import { getDeviceButtonColor, getDeviceErrorMessage } from "../../util"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"

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
   const {
      toggleCamera,
      cameraOn,
      localCameraTrack: { isLoading },
      cameraError,
   } = useLocalTracks()

   return (
      <Tooltip
         placement="top"
         title={getDeviceErrorMessage(cameraError, {
            permissionDenied:
               "Camera permission denied. Please enable it in your browser settings.",
            notReadable: "Camera in use by another app.",
            unknown: "Some error occurred with the camera.",
         })}
      >
         <BrandedBadge
            color="warning"
            badgeContent={cameraError ? "!" : undefined}
         >
            <ActionBarButtonStyled
               color={getDeviceButtonColor(cameraOn, isLoading, cameraError)}
               ref={ref}
               onClick={toggleCamera}
               sx={cameraOn ? undefined : styles.off}
               disabled={Boolean(cameraError) || isLoading}
               {...props}
            >
               {cameraOn ? <Video /> : <VideoOff />}
            </ActionBarButtonStyled>
         </BrandedBadge>
      </Tooltip>
   )
})

VideoActionButton.displayName = "VideoActionButton"
