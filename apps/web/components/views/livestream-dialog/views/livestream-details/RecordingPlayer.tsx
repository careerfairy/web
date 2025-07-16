import {
   LivestreamEvent,
   RecordingToken,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import {
   Box,
   Button,
   ButtonBase,
   Skeleton,
   Stack,
   Typography,
} from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import { alpha } from "@mui/material/styles"
import useRecordingProgressTracker from "components/views/common/stream-cards/useRecordingProgressTracker"
import { useRouter } from "next/router"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReactPlayer from "react-player"
import { OnProgressProps } from "react-player/base"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { livestreamRepo } from "../../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import { AnalyticsEvents } from "../../../../../util/analyticsConstants"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { useFirestoreDocument } from "../../../../custom-hook/utils/useFirestoreDocument"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   icon: {
      zIndex: 2,
      width: {
         xs: "56px",
         md: "72px",
      },
      height: {
         xs: "56px",
         md: "72px",
      },
      background: "rgba(33, 32, 32, 0.7)",
      border: "3px solid white",
      borderRadius: "50%",
      transition: "all 0.2s ease-in-out",

      "&:hover": {
         border: (theme) => `4px solid ${theme.palette.primary.main}`,
         transform: "scale(1.05)",
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
         borderRadius: 3,
         overflow: "hidden",
         boxShadow: (theme) => theme.legacy.boxShadows.dark_8_25_10,
         border: "1px solid rgba(255, 255, 255, 0.1)",
      },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
         "linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%)",
      borderRadius: 3,
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
         xs: "rgba(95, 95, 95, 0.9)",
         md: "rgba(95, 95, 95, 0.85)",
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
      backdropFilter: "blur(8px)",
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
   signUpButton: {
      borderRadius: 2,
      px: 3,
      py: 1.5,
      fontSize: "1rem",
      fontWeight: 600,
      textTransform: "none",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
         transform: "translateY(-2px)",
         boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
      },
   },
})

type Props = {
   stream: LivestreamEvent
   livestreamPresenter: LivestreamPresenter
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

const Player = ({ stream, livestreamPresenter }: Props) => {
   const { isLoggedIn } = useAuth()
   const router = useRouter()
   const playerRef = useRef<ReactPlayer | null>(null)
   const hasLoadedProgress = useRef(false)
   const hasAutoPlayed = useRef(false)
   const { data: recordingToken } = useRecordingToken(stream.id)
   const { handlePreviewPlay, handlePause, handlePlay, videoPaused } =
      useRecordingControls(stream)
   const { videoStartPosition, onSecondPassed } = useRecordingProgressTracker({
      livestream: stream,
      playing: !videoPaused,
   })

   const redirectToLogin = useCallback(() => {
      return router.push({
         pathname: `/login`,
         query: `absolutePath=${router.asPath}`,
      })
   }, [router])

   const handleClickPlay = useCallback(() => {
      if (!isLoggedIn) {
         redirectToLogin()
      } else {
         handlePlay()
      }
   }, [handlePlay, isLoggedIn, redirectToLogin])

   const handleProgress = useCallback(
      (progress: OnProgressProps) => {
         onSecondPassed(progress.playedSeconds)
      },
      [onSecondPassed]
   )

   const handleReady = useCallback(() => {
      if (videoStartPosition && !hasLoadedProgress.current) {
         playerRef.current?.seekTo(videoStartPosition)
         hasLoadedProgress.current = true
      }

      // Auto-play for logged-in users on page load
      if (isLoggedIn && !hasAutoPlayed.current) {
         hasAutoPlayed.current = true
         handlePreviewPlay()
      }
   }, [videoStartPosition, isLoggedIn, handlePreviewPlay])

   const SignUpButton = () => {
      return (
         <Button
            component="div"
            color={"primary"}
            variant="contained"
            onClick={redirectToLogin}
            sx={styles.signUpButton}
         >
            Sign up to watch
         </Button>
      )
   }

   const PlayIconElement = () => {
      if (isLoggedIn) return <PlayIcon sx={styles.icon} />

      return (
         <ButtonBase onClick={handleClickPlay}>
            <Stack alignItems={"center"} spacing={3}>
               <PlayIcon sx={styles.icon} />
               <SignUpButton />
            </Stack>
         </ButtonBase>
      )
   }

   return (
      <Box sx={styles.root}>
         <Box sx={styles.playerWrapper} mt={1}>
            <ReactPlayer
               ref={playerRef}
               className="react-player"
               playIcon={<PlayIconElement />}
               width="100%"
               height="100%"
               controls={isLoggedIn}
               url={downloadLinkWithDate(
                  livestreamPresenter.start,
                  livestreamPresenter.id,
                  recordingToken.sid
               )}
               onPlay={handleClickPlay}
               onPause={handlePause}
               onReady={handleReady}
               playing={isLoggedIn}
               config={{ file: { attributes: { controlsList: "nodownload" } } }}
               light={livestreamPresenter.backgroundImageUrl}
               onClickPreview={handlePreviewPlay}
               onProgress={handleProgress}
               progressInterval={1000}
            />
         </Box>
      </Box>
   )
}

type CountDownProps = {
   stream: LivestreamPresenter
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

type UseRecordingControls = {
   handlePlay: () => void
   handlePause: () => void
   handleClosePlayer: () => void
   showBigVideoPlayer: boolean
   handlePreviewPlay: () => void
   videoPaused: boolean
}
export const useRecordingControls = (
   stream: LivestreamEvent
): UseRecordingControls => {
   const isMobile = useIsMobile()
   const { userData, isLoggedIn } = useAuth()

   // Auto-play for logged-in users on past livestream recordings
   const [videoPaused, setVideoPaused] = useState(!isLoggedIn)

   const [showBigVideoPlayer, setShowBigVideoPlayer] = useState(false)

   // Auto-play when user logs in
   useEffect(() => {
      if (isLoggedIn) {
         setVideoPaused(false)
      } else {
         setVideoPaused(true)
      }
   }, [isLoggedIn])

   // handle play recording click
   const handleRecordingPlay = useCallback(() => {
      setVideoPaused(false)
      if (!isMobile) {
         // update to a bigger screen on desktop
         setShowBigVideoPlayer(true)
      }
   }, [isMobile])

   const handleCloseRecordingPlayer = useCallback(() => {
      setShowBigVideoPlayer(false)
   }, [])

   // handle preview play icon click
   const handlePreviewPlay = useCallback(() => {
      if (!isLoggedIn) return

      // update recording stats
      void livestreamRepo.updateRecordingStats({
         livestreamId: stream.id,
         userId: userData?.userEmail,
         livestreamStartDate: stream.start,
      })

      // play recording
      handleRecordingPlay()
      // track recording_play event when playback actually starts
      dataLayerLivestreamEvent(AnalyticsEvents.RecordingPlay, stream)
   }, [isLoggedIn, stream, userData?.userEmail, handleRecordingPlay])

   const handlePause = useCallback(() => {
      setVideoPaused(true)
   }, [])

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
