import { Video, VideoOff } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context/LocalTracks"
import { useCameras } from "components/custom-hook/streaming"
import { Tooltip } from "@mui/material"

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
   } = useLocalTracks()

   const { error } = useCameras()

   const camPermDenied = error?.code === "PERMISSION_DENIED"

   return (
      <Tooltip
         placement="top"
         title={
            camPermDenied
               ? "Camera permission denied. Please enable it in your browser settings."
               : ""
         }
      >
         <span>
            <ActionBarButtonStyled
               color={!cameraOn ? "error" : undefined}
               ref={ref}
               onClick={toggleCamera}
               sx={!cameraOn ? styles.off : undefined}
               disabled={camPermDenied || isLoading}
               {...props}
            >
               {cameraOn ? <Video /> : <VideoOff />}
            </ActionBarButtonStyled>
         </span>
      </Tooltip>
   )
})

VideoActionButton.displayName = "VideoActionButton"
