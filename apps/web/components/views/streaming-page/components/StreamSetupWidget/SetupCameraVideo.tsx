import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { LocalMicrophoneAndCameraUser } from "../streaming/LocalMicrophoneAndCameraUser"
import { CameraDisabledOverlay } from "./CameraDisabledOverlay"

const styles = sxStyles({
   video: {
      aspectRatio: "16/9",
      width: "100%",
   },
})

export const SetupCameraVideo = () => {
   const { cameraOn } = useLocalTracks()

   return (
      <LocalMicrophoneAndCameraUser hideDetails sx={styles.video}>
         {!cameraOn && <CameraDisabledOverlay />}
      </LocalMicrophoneAndCameraUser>
   )
}
