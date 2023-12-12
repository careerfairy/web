import { Box, Skeleton, Typography } from "@mui/material"
import ReactPlayer from "react-player"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import DateUtil from "../../../../../util/DateUtil"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { useFirestoreDocument } from "../../../../custom-hook/utils/useFirestoreDocument"
import {
   LivestreamEvent,
   RecordingToken,
} from "@careerfairy/shared-lib/livestreams"
import useCountTime from "../../../../custom-hook/useCountTime"
import { livestreamRepo } from "../../../../../data/RepositoryInstances"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { alpha } from "@mui/material/styles"
import CircularProgress from "@mui/material/CircularProgress"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   icon: {
      zIndex: 2,
      width: {
         xs: "45px",
         md: "65px",
      },
      height: {
         xs: "45px",
         md: "65px",
      },
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
   playerWrapper: {
      position: "relative",
      aspectRatio: "16 / 9",
      "& .react-player": {
         borderRadius: 2,
         overflow: "hidden",
         boxShadow: (theme) => theme.boxShadows.dark_8_25_10,
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   playSkeleton: {},
   countDown: {
      position: "absolute",
      bottom: 0,
      px: 1.5,
      py: 1,
      transform: "translateX(-50%)",
      left: "50%",
      background: {
         xs: "rgba(95, 95, 95, 0.85)",
         md: "rgba(95, 95, 95, 0.75)",
      },
      borderColor: "white",
      borderStyle: "solid",
      borderWidth: {
         xs: "1px",
         md: "2px",
      },
      borderRadius: 12,
      mb: {
         xs: 0.75,
         md: 1.625,
      },
      width: "max-content",
   },
   recordingTitle: {
      fontWeight: 600,
      fontSize: {
         xs: "0.857rem",
         md: "1rem",
      },
   },
   videoSkeleton: {
      backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
      position: "absolute",
      inset: 0,
   },
})

type Props = {
   stream: LivestreamEvent
   livestreamPresenter: LivestreamPresenter
   boughtAccess: boolean
}

const RecordingPlayer: FC<Props> = (props) => {
   return (
      <SuspenseWithBoundary fallback={<PlayerSkeleton />}>
         <Player {...props} />
      </SuspenseWithBoundary>
   )
}

export const PlayerSkeleton: FC = () => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.playerWrapper}>
            <CircularProgress color="info" sx={styles.playSkeleton} />
            <Skeleton
               sx={styles.videoSkeleton}
               variant="rectangular"
               animation="pulse"
               width="100%"
               height="100%"
            />
         </Box>
      </Box>
   )
}

const Player: FC<Props> = ({
   stream,
   boughtAccess = false,
   livestreamPresenter,
}) => {
   const { handlePreviewPlay, handlePause, handlePlay } = useRecordingControls(
      stream,
      boughtAccess
   )

   const { data: recordingToken } = useRecordingToken(stream.id)

   return (
      <Box sx={styles.root}>
         <Box sx={styles.playerWrapper} mt={1}>
            <ReactPlayer
               className="react-player"
               playIcon={
                  <>
                     <Box sx={styles.countDown}>
                        {!boughtAccess ? (
                           <RecordingTitle>
                              Recording Unlocked for{" "}
                              <CountDown stream={livestreamPresenter} />
                           </RecordingTitle>
                        ) : (
                           <RecordingTitle>
                              You bought access to this recording:
                           </RecordingTitle>
                        )}
                     </Box>
                     <PlayIcon sx={styles.icon} />
                  </>
               }
               width="100%"
               height="100%"
               controls={true}
               url={downloadLinkWithDate(
                  livestreamPresenter.start,
                  livestreamPresenter.id,
                  recordingToken.sid
               )}
               onPlay={handlePlay}
               onPause={handlePause}
               playing={true}
               config={{ file: { attributes: { controlsList: "nodownload" } } }}
               light={livestreamPresenter.backgroundImageUrl}
               onClickPreview={handlePreviewPlay}
            />
         </Box>
      </Box>
   )
}

type CountDownProps = {
   stream: LivestreamPresenter
}
const CountDown = ({ stream }: CountDownProps) => {
   const [countDown, setCountDown] = useState("")

   const saveTimeLeft = (maxDateToShowRecording: Date) => {
      const timeLeft = DateUtil.calculateTimeLeft(maxDateToShowRecording)
      setCountDown(
         `${timeLeft.Days || 0}d ${timeLeft.Hours || 0}h ${
            timeLeft.Minutes || 0
         }min ${timeLeft.Seconds || 0}sec`
      )
   }

   useEffect(() => {
      const maxDateToShowRecording = stream.recordingAccessTimeLeft()

      // This calculates the remaining time to access to the recording on the mount
      saveTimeLeft(maxDateToShowRecording)

      const interval = setInterval(() => {
         // This calculates every second the remaining time to access to the recording
         saveTimeLeft(maxDateToShowRecording)
      }, 1000)

      return () => clearTimeout(interval)
   }, [stream])

   return (
      <Typography
         variant="inherit"
         display="inline"
         fontWeight="bold"
         color="primary"
      >
         {countDown}
      </Typography>
   )
}

const RecordingTitle: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   return (
      <Typography sx={styles.recordingTitle} variant={"body1"}>
         {children}
      </Typography>
   )
}

type UseRecordingControls = {
   handlePlay: () => void
   handlePause: () => void
   handleClosePlayer: () => void
   showBigVideoPlayer: boolean
   handlePreviewPlay: () => void
   videoPaused: boolean
}
export const useRecordingControls = (
   stream: LivestreamEvent,
   userHasBoughtRecording: boolean
): UseRecordingControls => {
   const isMobile = useIsMobile()
   const { userData } = useAuth()

   const {
      timeWatched: minutesWatched,
      startCounting,
      pauseCounting,
   } = useCountTime()

   /**
    * Each minute watched the field minutesWatched will be increased and we need do increment it on our DB
    */
   useEffect(() => {
      if (minutesWatched > 0) {
         void livestreamRepo.updateRecordingStats({
            livestreamId: stream.id,
            minutesWatched: 1,
            onlyIncrementMinutes: true,
            userId: userData?.userEmail,
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [minutesWatched, userData?.userEmail])

   const [videoPaused, setVideoPaused] = useState(true)

   const [showBigVideoPlayer, setShowBigVideoPlayer] = useState(false)

   // handle play recording click
   const handleRecordingPlay = useCallback(() => {
      startCounting()
      setVideoPaused(false)
      if (!isMobile) {
         // update to a bigger screen on desktop
         setShowBigVideoPlayer(true)
      }
   }, [isMobile, startCounting])

   const handleCloseRecordingPlayer = useCallback(() => {
      setShowBigVideoPlayer(false)
   }, [])

   // handle preview play icon click
   const handlePreviewPlay = useCallback(() => {
      // update recording stats
      void livestreamRepo.updateRecordingStats({
         livestreamId: stream.id,
         userId: userData.userEmail,
         livestreamStartDate: stream.start,
         usedCredits: Boolean(userHasBoughtRecording),
      })

      // play recording
      handleRecordingPlay()
   }, [
      handleRecordingPlay,
      stream?.id,
      stream?.start,
      userData?.userEmail,
      userHasBoughtRecording,
   ])

   const handlePause = useCallback(() => {
      pauseCounting()
      setVideoPaused(true)
   }, [pauseCounting])

   return useMemo(
      () => ({
         handlePlay: handleRecordingPlay,
         handlePause,
         handleClosePlayer: handleCloseRecordingPlayer,
         handlePreviewPlay,
         showBigVideoPlayer,
         videoPaused,
      }),
      [
         handleCloseRecordingPlayer,
         handlePause,
         handlePreviewPlay,
         handleRecordingPlay,
         showBigVideoPlayer,
         videoPaused,
      ]
   )
}

const useRecordingToken = (livestreamId: string) => {
   return useFirestoreDocument<RecordingToken>("livestreams", [
      livestreamId,
      "recordingToken",
      "token",
   ])
}

export default RecordingPlayer
