import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import BackToMainRoomIcon from "@mui/icons-material/ArrowBackIos"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import { Box, Slide, Typography } from "@mui/material"
import { ReactNode } from "react"
import ReactPlayer from "react-player"
import { sxStyles } from "../../../../types/commonTypes"
import useIsMobile from "../../../custom-hook/useIsMobile"

type Props = {
   stream: LivestreamPresenter
   handlePlay?: () => void
   handlePause?: () => void
   handlePreviewPlay?: () => void
   handleClosePlayer?: () => void
   showBigVideoPlayer?: boolean
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
   handlePreviewPlay,
   handlePause,
   showBigVideoPlayer,
   recordingSid,
}: Props) => {
   const isMobile = useIsMobile()

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

                  <RecordingTitle isMobile={isMobile}>
                     You have access to this recording:
                  </RecordingTitle>
               </Box>
            </Slide>
         )}

         <Box mt={1}>
            <ReactPlayer
               className="react-player"
               playIcon={<PlayIcon sx={styles.icon} />}
               width="100%"
               height={
                  showBigVideoPlayer
                     ? isMobile
                        ? "400px"
                        : "600px"
                     : isMobile
                     ? "200px"
                     : "400px"
               }
               controls={true}
               url={downloadLinkWithDate(stream.start, stream.id, recordingSid)}
               onPlay={handlePlay}
               onPause={handlePause}
               playing={true}
               config={{ file: { attributes: { controlsList: "nodownload" } } }}
               light={stream.backgroundImageUrl}
               onClickPreview={handlePreviewPlay}
            />
         </Box>
      </Box>
   )
}

const RecordingTitle = ({
   isMobile,
   children,
}: {
   isMobile: boolean
   children: ReactNode
}) => {
   return (
      <Typography
         variant={isMobile ? "h4" : "h5"}
         mt={1}
         fontWeight={isMobile ? "bold" : "unset"}
      >
         {children}
      </Typography>
   )
}

export default RecordingPlayer
