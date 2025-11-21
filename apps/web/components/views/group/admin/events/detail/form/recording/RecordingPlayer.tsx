import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import { Box, CircularProgress, IconButton, Typography } from "@mui/material"
import { useRecordingTokenSWR } from "components/custom-hook/recordings/useRecordingTokenSWR"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback } from "react"
import { Play } from "react-feather"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"
import { useRecordingFormContext } from "./RecordingFormProvider"

const styles = sxStyles({
   playerWrapper: {
      position: "relative",
      aspectRatio: "16 / 9",
      borderRadius: 1.5,
      overflow: "hidden",
      "& .react-player": {
         borderRadius: "12px",
         overflow: "hidden",
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
   errorMessage: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      p: 2,
      textAlign: "center",
   },
   thumbnail: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      cursor: "pointer",
   },
   playButtonOverlay: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: { xs: 60, md: 80 },
      height: { xs: 60, md: 80 },
      borderRadius: "50%",
      backgroundColor: "#B0B0B0",
      border: "2px solid #B0B0B0",
      cursor: "pointer",
      "&:hover": {
         backgroundColor: "#B0B0B0",
         border: "2px solid #B0B0B0",
      },
   },
})

export const RecordingPlayer = () => {
   const { livestream, playerRef, setIsPlaying, isPlaying } =
      useRecordingFormContext()
   const isMobile = useIsMobile()
   const {
      data: recordingToken,
      isLoading,
      error,
   } = useRecordingTokenSWR(livestream.id)

   const recordingUrl = recordingToken
      ? downloadLinkWithDate(
           livestream.start?.toDate(),
           livestream.id,
           recordingToken.sid
        )
      : null

   const handlePlayClick = useCallback(() => {
      setIsPlaying(true)
   }, [setIsPlaying])

   const hasThumbnail = !isPlaying && livestream.backgroundImageUrl

   if (isLoading) {
      return (
         <Box sx={styles.playerWrapper}>
            <Box sx={styles.loadingContainer}>
               <CircularProgress />
            </Box>
         </Box>
      )
   }

   if (error || !recordingUrl) {
      return (
         <Box sx={styles.playerWrapper}>
            <Box sx={styles.errorMessage}>
               <Typography variant="small" color="text.secondary">
                  {error
                     ? "Failed to load recording"
                     : "Recording not available"}
               </Typography>
            </Box>
         </Box>
      )
   }

   return (
      <Box sx={styles.playerWrapper}>
         <ReactPlayer
            ref={playerRef}
            url={recordingUrl}
            playing={isPlaying}
            controls={isPlaying}
            width="100%"
            height="100%"
            playsInline
            onPlay={handlePlayClick}
            onEnded={() => setIsPlaying(false)}
         />
         {Boolean(hasThumbnail) && (
            <Box
               onClick={handlePlayClick}
               sx={{
                  ...styles.thumbnail,
                  backgroundImage: `url(${livestream.backgroundImageUrl})`,
               }}
               aria-label="Play recording"
               role="button"
               tabIndex={0}
            />
         )}
         {!isPlaying && (
            <IconButton
               sx={styles.playButtonOverlay}
               onClick={handlePlayClick}
               aria-label="Play recording"
            >
               <Play size={isMobile ? 30 : 40} fill="#D9D9D9" color="#D9D9D9" />
            </IconButton>
         )}
      </Box>
   )
}

export default RecordingPlayer
