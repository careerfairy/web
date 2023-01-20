import { Box, Slide, Typography } from "@mui/material"
import ReactPlayer from "react-player"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import React, { useEffect, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import DateUtil from "../../../../util/DateUtil"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import BackToMainRoomIcon from "@mui/icons-material/ArrowBackIos"

type Props = {
   stream: LivestreamPresenter
   handlePlay?: () => void
   handleClosePlayer?: () => void
   showBigVideoPlayer?: boolean
   maxDaysToShowRecording?: number
   recordingSid?: string
}

const styles = sxStyles({
   icon: {
      zIndex: 2,
      width: "60px",
      height: "60px",
      left: "999px",
      top: "475px",
      background: "rgba(33, 32, 32, 0.6)",
      border: "2px solid white",
      borderRadius: "50%",

      "&:hover": {
         border: (theme) => `3px solid ${theme.palette.primary.main}`,
      },
   },
   backButton: {
      display: "flex",
      width: "fit-content",
      cursor: "pointer",
      alignItems: "center",
      fontSize: "14px",
      height: "20px",

      "&:hover": {
         fontSize: "15px",
      },
   },
})

const RecordingPlayer = ({
   stream,
   handlePlay,
   handleClosePlayer,
   showBigVideoPlayer,
   maxDaysToShowRecording,
   recordingSid,
}: Props) => {
   const [countDown, setCountDown] = useState("")
   const isMobile = useIsMobile()

   const saveTimeLeft = (maxDateToShowRecording: Date) => {
      const timeLeft = DateUtil.calculateTimeLeft(maxDateToShowRecording)
      setCountDown(
         `${timeLeft.Days || 0}d ${timeLeft.Hours || 0}h ${
            timeLeft.Minutes || 0
         }min ${timeLeft.Seconds || 0}sec`
      )
   }

   useEffect(() => {
      const maxDateToShowRecording = stream.recordingAccessTimeLeftMs()

      // This calculates the remaining time to access to the recording on the mount
      saveTimeLeft(maxDateToShowRecording)

      const interval = setInterval(() => {
         // This calculates every second the remaining time to access to the recording
         saveTimeLeft(maxDateToShowRecording)
      }, 1000)

      return () => clearTimeout(interval)
   }, [maxDaysToShowRecording, stream])

   return (
      <Box>
         {showBigVideoPlayer ? (
            <>
               {!isMobile && (
                  <Box sx={styles.backButton} onClick={handleClosePlayer}>
                     <BackToMainRoomIcon fontSize="inherit" />
                     <Typography variant="inherit" fontWeight="bold">
                        Back
                     </Typography>
                  </Box>
               )}
            </>
         ) : (
            <Slide direction="left" timeout={1000} in={!showBigVideoPlayer}>
               <Box>
                  {isMobile ? null : (
                     <Typography variant="h4" fontWeight="bold">
                        Live stream recording
                     </Typography>
                  )}

                  <Typography
                     variant={isMobile ? "h4" : "h5"}
                     mt={1}
                     fontWeight={isMobile ? "bold" : "unset"}
                  >
                     Only{" "}
                     <Typography
                        variant="inherit"
                        display="inline"
                        fontWeight="bold"
                        color="primary"
                     >
                        {countDown}
                     </Typography>{" "}
                     left to rewatch the live stream!
                  </Typography>
               </Box>
            </Slide>
         )}

         <Box mt={4}>
            <ReactPlayer
               className="react-player"
               playIcon={<PlayIcon sx={styles.icon} />}
               width="100%"
               height={
                  showBigVideoPlayer
                     ? isMobile
                        ? "400px"
                        : "700px"
                     : isMobile
                     ? "200px"
                     : "400px"
               }
               controls={true}
               url={downloadLinkWithDate(stream.start, stream.id, recordingSid)}
               onPlay={handlePlay}
               playing={true}
               config={{ file: { attributes: { controlsList: "nodownload" } } }}
               light={stream.backgroundImageUrl}
               onClickPreview={handlePlay}
            />
         </Box>
      </Box>
   )
}

export default RecordingPlayer
