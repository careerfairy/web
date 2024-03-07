import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { UserStreamProvider } from "../../context/UserStream"
import { LocalStream } from "../streaming"
import { useSettingsMenu } from "./SettingsMenuContext"

const styles = sxStyles({
   video: {
      aspectRatio: "16/9",
      width: "100%",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      "& .videoTrack": {
         "& > div": {
            backgroundColor: (theme) => theme.brand.white[300] + " !important",
         },
      },
   },
})

export const TempCameraSetup = () => {
   const { localUser } = useLocalTracks()
   const { tempCameraTrack } = useSettingsMenu()

   return (
      <UserStreamProvider user={localUser}>
         <LocalStream
            localCameraTrack={tempCameraTrack.localCameraTrack}
            isLoading={tempCameraTrack.isLoading}
            hideDetails
            hideSpeakingIndicator
            sx={styles.video}
            cameraOn
            containVideo
            hideGradient
         />
      </UserStreamProvider>
   )
}
