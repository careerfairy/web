import { Box, CircularProgress } from "@mui/material"
import { UserStreamComponent } from "../gallery/UserStreamComponent"
import { useSpotlight } from "./SpotlightProvider"
import { sxStyles } from "types/commonTypes"
import { ConditionalStreamAspectRatio } from "../../streaming/ConditionalStreamAspectRatio"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useDelayedValue } from "components/custom-hook/utils/useDelayedValue"
import { useRemoteUserTrack } from "agora-rtc-react"

const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      "& .videoTrackWrapper": {
         borderRadius: "10px",
      },
   },
})

export const SpotlightStream = () => {
   const { stream } = useSpotlight()

   const hasStream = Boolean(stream)
   /**
    * Delays the rendering of the stream to mitigate issues during the transition
    * from gallery to spotlight, specifically avoiding race conditions in video
    * track play/stop actions.
    */
   const delayedHasStream = useDelayedValue(hasStream, 1000)

   if (!delayedHasStream) {
      return hasStream ? (
         <CircularProgress />
      ) : (
         <Box>Please wait while the host is setting up their stream</Box>
      )
   }

   return <Content />
}

const Content = () => {
   const { stream } = useSpotlight()
   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()

   const isRemoteStream =
      stream.type === "remote-user" || stream.type === "remote-user-screen"

   // the only way to detect changes in a remote video/audio track is to use this hook
   // if not the component will not re-render when the track changes
   const { track: remoteVideoTrack } = useRemoteUserTrack(
      isRemoteStream ? stream.user : null,
      "video"
   )

   const isMobilePortrait = streamIsMobile && !streamIsLandscape

   if (!stream) return <CircularProgress />

   return (
      <Box sx={styles.root}>
         <ConditionalStreamAspectRatio
            originalStreamAspectRatio={isMobilePortrait}
            track={isRemoteStream ? remoteVideoTrack : stream.user.videoTrack}
         >
            <UserStreamComponent user={stream} />
         </ConditionalStreamAspectRatio>
      </Box>
   )
}
