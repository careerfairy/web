import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { LocalUserStream } from "../streaming/LocalStream"
import { CameraDisabledOverlay } from "./CameraDisabledOverlay"
import { UserStreamProvider } from "../../context/UserStream"

const styles = sxStyles({
   video: {
      aspectRatio: "16/9",
      width: "100%",
      borderRadius: "8px",
   },
})

export const SetupCameraVideo = () => {
   const { cameraOn, localUser } = useLocalTracks()

   return (
      <UserStreamProvider user={localUser}>
         <LocalUserStream hideDetails hideSpeakingIndicator sx={styles.video}>
            {!cameraOn && <CameraDisabledOverlay />}
         </LocalUserStream>
      </UserStreamProvider>
   )
}
