import { Box, CircularProgress, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamVideo } from "components/custom-hook/streaming/useLivestreamVideo"
import { useStreamingContext } from "components/views/streaming-page/context"
import { sxStyles } from "types/commonTypes"
import { SynchronizedVideo } from "./SynchronizedVideo"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
      borderRadius: "12px",
      overflow: "hidden",
      backgroundColor: (theme) => theme.brand.white[500],
   },
})

export const SpotlightVideo = () => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { data: video } = useLivestreamVideo(livestreamId)

   if (!video) {
      return (
         <Box sx={styles.root}>
            <Typography variant="mobileBrandedH4" textAlign="center">
               Please wait for the host to load the video
            </Typography>
         </Box>
      )
   }

   return (
      <Box sx={styles.root}>
         <SuspenseWithBoundary fallback={<CircularProgress />}>
            <SynchronizedVideo
               video={video}
               userId={agoraUserId}
               livestreamId={livestreamId}
            />
         </SuspenseWithBoundary>
      </Box>
   )
}
