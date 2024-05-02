import { forwardRef } from "react"
import { Video, VideoOff } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context/LocalTracks"
import { getCameraErrorMessage, getDeviceButtonColor } from "../../util"
import { BrandedTooltip } from "../BrandedTooltip"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

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
      fetchCamerasError,
   } = useLocalTracks()

   return (
      <DeviceErrorWrapper
         errorMessage={getCameraErrorMessage(cameraError || fetchCamerasError)}
      >
         <BrandedTooltip
            title={cameraOn ? "Switch camera off" : "Switch camera on"}
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
         </BrandedTooltip>
      </DeviceErrorWrapper>
   )
})

VideoActionButton.displayName = "VideoActionButton"
