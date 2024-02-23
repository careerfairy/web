import { Box } from "@mui/material"
import { UserStreamComponent } from "../gallery/UserStreamComponent"
import { useSpotlight } from "./SpotlightProvider"
import { sxStyles } from "types/commonTypes"
import { ConditionalStreamAspectRatio } from "../../streaming/ConditionalStreamAspectRatio"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"

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

   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()

   const isMobilePortrait = streamIsMobile && !streamIsLandscape

   if (!stream) {
      return <Box>Please wait while the host is setting up the stream</Box>
   }

   return (
      <Box sx={styles.root}>
         <ConditionalStreamAspectRatio
            useStreamAspectRatio={isMobilePortrait}
            track={stream.user.videoTrack}
         >
            <UserStreamComponent user={stream} />
         </ConditionalStreamAspectRatio>
      </Box>
   )
}
