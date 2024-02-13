import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { LocalUserStream } from "../streaming/LocalStream"
import { CameraDisabledOverlay } from "./CameraDisabledOverlay"

const styles = sxStyles({
   video: {
      aspectRatio: "16/9",
      width: "100%",
      borderRadius: "8px",
   },
})

export const SetupCameraVideo = () => {
   const { cameraOn } = useLocalTracks()

   return (
      <LocalUserStream hideDetails hideSpeakingIndicator sx={styles.video}>
         {!cameraOn && <CameraDisabledOverlay />}
      </LocalUserStream>
   )
}
