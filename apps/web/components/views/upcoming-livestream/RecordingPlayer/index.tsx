import { Box, Slide, Typography } from "@mui/material"
import ReactPlayer from "react-player"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import React, { useEffect, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import DateUtil from "../../../../util/DateUtil"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import useIsMobile from "../../../custom-hook/useIsMobile"

type Props = {
   stream: LivestreamEvent
   handlePlay?: () => void
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
})

const RecordingPlayer = ({
   stream,
   handlePlay,
   showBigVideoPlayer,
   maxDaysToShowRecording,
   recordingSid,
}: Props) => {
   const [countdown, setCountDown] = useState("")
   const isMobile = useIsMobile()

   const saveTimeLeft = (maxDateToShowRecording: Date) => {
      const timeLeft = DateUtil.calculateTimeLeft(maxDateToShowRecording)
      setCountDown(
         `${timeLeft.Days}d ${timeLeft.Hours}h ${timeLeft.Minutes}min ${timeLeft.Seconds}sec`
      )
   }

   useEffect(() => {
      const streamDate = stream?.start.toDate()

      const maxDateToShowRecording = streamDate
      maxDateToShowRecording.setDate(
         streamDate.getDate() + maxDaysToShowRecording
      )

      // This calculates the remaining time to access to the recording on the mount
      saveTimeLeft(maxDateToShowRecording)

      const interval = setInterval(() => {
         // This calculates every second the remaining time to access to the recording
         saveTimeLeft(maxDateToShowRecording)
      }, 1000)

      return () => clearTimeout(interval)
   }, [maxDaysToShowRecording, stream?.start])

   return (
      <Box>
         {showBigVideoPlayer ? null : (
            <Slide direction="left" timeout={1000} in={!showBigVideoPlayer}>
               <Box>
                  {isMobile ? null : (
                     <Typography variant="h4" fontWeight="bold">
                        Live stream recording
                     </Typography>
                  )}

                  <Typography variant="h5" mt={1}>
                     Only{" "}
                     <Typography
                        variant="h5"
                        display="inline"
                        fontWeight="bold"
                        color="primary"
                     >
                        {countdown}
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
               height={showBigVideoPlayer ? "700px" : "400px"}
               controls={true}
               url={downloadLinkWithDate(
                  stream.start.toDate(),
                  stream.id,
                  recordingSid
               )}
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
