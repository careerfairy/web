import { Video, VideoOff } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context/LocalTracks"
import { getCameraErrorMessage, getDeviceButtonColor } from "../../util"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"

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
      </DeviceErrorWrapper>
   )
})

VideoActionButton.displayName = "VideoActionButton"
