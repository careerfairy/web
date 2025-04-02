import { SECONDS_TO_AUTO_PLAY_LIVESTREAM } from "@careerfairy/shared-lib/livestreams/constants"
import { RecordingToken } from "@careerfairy/shared-lib/livestreams/livestreams"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { useRecordingTokenSWR } from "components/custom-hook/recordings/useRecordingTokenSWR"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   addMinutes,
   getResizedUrl,
} from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import { useAuth } from "HOCs/AuthProvider"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import DateUtil from "util/DateUtil"
import EventPreviewCardChipLabels from "./EventPreviewCardChipLabels"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"
import { RecordingPlayIcon } from "./RecordingPlayIcon"
import RecordingPreviewCardContainer from "./RecordingPreviewCardContainer"
import { RecordingUnavailableIcon } from "./RecordingUnavailableIcon"
import useRecordingProgressTracker from "./useRecordingProgressTracker"
const bottomContentHeight = 50

const styles = sxStyles({
   backgroundImageWrapper: {
      filter: "brightness(75%)",
      display: "flex",
      height: "112px",
      width: "100%",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
   },
   backgroundImageWrapperRecording: {
      display: "flex",
      aspectRatio: "16/9",
      width: "100%",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
   },
   backgroundImageWrapperWithBottomContent: {
      height: `calc(112px + ${bottomContentHeight / 2}px)`,
   },
   backgroundImageLoader: {
      position: "absolute",
      inset: 0,
      height: "auto",
      borderRadius: "8px",
   },
   recordingWrapper: {
      overflow: "hidden",
      position: "relative",
      width: "100%",
      height: "100%",
   },
   noRecordingWrapper: {
      overflow: "hidden",
      position: "relative",
      width: "100%",
      height: "100%",
      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         background: "rgba(0, 0, 0, 0.60)",
         borderRadius: "8px",
         backdropFilter: "blur(17.5px)",
      },
   },
   calendarDate: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      justifyContent: "center",
      backgroundColor: "white",
      border: "none !important",
      width: "56px",
      height: "64px",
      padding: "12px",
      gap: "-4px",
      flexShrink: 0,
      borderRadius: "0px 0px 6px 6px",
      boxShadow: "0px 0px 12px 0px rgba(20, 20, 20, 0.08)",
      position: "absolute",
      marginRight: "12px",
   },
   startDay: {
      color: (theme) => theme.palette.primary.main,
      fontWeight: 700,
   },
   startMonth: {
      textAlign: "center",
      fontWeight: "400",
      marginTop: "-4px",
      color: (theme) => theme.palette.neutral[900],
      "&::first-letter": {
         textTransform: "uppercase",
      },
   },
   recordingPlayIcon: {
      width: "68px",
      height: "68px",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
   frownIcon: {
      width: "28px",
      height: "28px",
      mb: 0.5,
      color: (theme) => theme.brand.white[100],
   },
   noRecordingText: {
      color: (theme) => theme.brand.white[100],
      position: "absolute",
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
   },
   timestamp: {
      display: "flex",
      padding: "2px 4px",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      borderRadius: "4px",
      background: "rgba(31, 31, 35, 0.70)",
      bottom: "10px",
      left: "8px",
      position: "absolute",
      color: (theme) => theme.brand.white[100],
   },
   duration: {
      display: "flex",
      padding: "2px 4px",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      borderRadius: "4px",
      background: "rgba(31, 31, 35, 0.70)",
      bottom: "10px",
      right: "8px",
      position: "absolute",
      color: (theme) => theme.brand.white[100],
   },
})

const CalendarDate = ({ startDate }: { startDate: Date }) => {
   const getStartDay = useMemo<number>(() => {
      return new Date(startDate).getDate()
   }, [startDate])

   const getStartMonth = useMemo<string>(() => {
      return DateUtil.getMonth(
         new Date(startDate).getMonth(),
         true
      ).toLowerCase()
   }, [startDate])
   return (
      <Box sx={styles.calendarDate}>
         <Typography variant={"brandedH3"} sx={styles.startDay}>
            {getStartDay}
         </Typography>
         <Typography variant={"xsmall"} sx={styles.startMonth}>
            {getStartMonth}
         </Typography>
      </Box>
   )
}

export const HeroPreview = () => {
   const {
      livestream,
      loading,
      animation,
      bottomElement,
      hideChipLabels,
      startDate,
      isPlaceholderEvent,
   } = useEventPreviewCardContext()
   return (
      <>
         <Box
            className="backgroundImageWrapper"
            sx={[
               styles.backgroundImageWrapper,
               bottomElement && styles.backgroundImageWrapperWithBottomContent,
            ]}
         >
            {loading ? (
               <Skeleton
                  animation={animation ?? "wave"}
                  variant="rectangular"
                  sx={styles.backgroundImageLoader}
               />
            ) : (
               <>
                  <Image
                     alt="Illustration"
                     src={
                        getResizedUrl(livestream?.backgroundImageUrl, "lg") ||
                        placeholderBanner
                     }
                     fill
                     priority
                     className="backgroundImage"
                     sizes="(max-width: 647px) 100vw, (max-width: 1279px) 50vw, 33vw"
                     style={{
                        objectFit: "cover",
                     }}
                  />
               </>
            )}
         </Box>
         {hideChipLabels || loading ? null : <EventPreviewCardChipLabels />}

         {isPlaceholderEvent || loading ? null : (
            <CalendarDate startDate={startDate} />
         )}
      </>
   )
}

export const HeroRecording = () => {
   const {
      livestream,
      loading,
      animation,
      bottomElement,
      hideChipLabels,
      autoPlaying,
      setAutoPlaying,
      onGoNext,
      disableAutoPlay,
      cardInView,
   } = useEventPreviewCardContext()
   const { isLoggedIn, isLoadingAuth } = useAuth()
   const isMobile = useIsMobile()
   const { data: recordingToken, isLoading: recordingTokenLoading } =
      useRecordingTokenSWR(livestream.id)
   const [preview, setPreview] = useState(false)

   const recordingNotAvailable =
      livestream.denyRecordingAccess || !recordingToken

   /**
    * Auto-plays recordings on mobile when they become visible.
    * Uses intersection observer to detect when card is 100% in viewport.
    *
    * Flow:
    * 1. Card enters view -> Start playing after 200ms delay
    * 2. Card exits view -> Stop playing
    * 3. After auto-play duration -> Go to next recording
    *
    * @param disableAutoPlay - Disables auto-play if true
    * @param isMobile - Is mobile device
    * @param inView - Is card visible
    * @param onGoNext - Handler for going to next recording
    */
   useEffect(() => {
      let timeout: NodeJS.Timeout

      if (isMobile && cardInView && !disableAutoPlay) {
         if (recordingNotAvailable) {
            timeout = setTimeout(() => {
               onGoNext?.()
            }, 5000)
         } else {
            timeout = setTimeout(() => {
               setAutoPlaying(true)
            }, 200)
         }
      } else if (!cardInView) {
         setAutoPlaying(false)
      }

      return () => clearTimeout(timeout)
   }, [
      isMobile,
      cardInView,
      setAutoPlaying,
      disableAutoPlay,
      recordingNotAvailable,
      onGoNext,
   ])

   // Set up auto-playing timeout for mobile experience
   useEffect(() => {
      if (disableAutoPlay || recordingNotAvailable) return

      let timeout: NodeJS.Timeout

      if (!disableAutoPlay && autoPlaying && preview) {
         // After auto-play we should transition to the next recording
         timeout = setTimeout(() => {
            setAutoPlaying(false)
            if (isMobile && autoPlaying) {
               onGoNext?.()
            }
         }, SECONDS_TO_AUTO_PLAY_LIVESTREAM)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [
      autoPlaying,
      disableAutoPlay,
      isMobile,
      onGoNext,
      setAutoPlaying,
      recordingNotAvailable,
      preview,
   ])

   // changes autoplay mode to preview (plays only 20 seconds)
   useEffect(() => {
      if (!isLoadingAuth && !isLoggedIn) {
         setPreview(true)
      }
   }, [isLoggedIn, isLoadingAuth, isMobile])

   // disables auto play if it changes while already playing (e.g open LS dialog)
   useEffect(() => {
      if (disableAutoPlay) {
         setAutoPlaying(false)
      }
   }, [disableAutoPlay, setAutoPlaying])

   const onVideoEnded = useCallback(() => {
      // only move if card is still playing, avoids edge-case where new elements come
      // into view while card is still playing
      autoPlaying && onGoNext?.()
   }, [onGoNext, autoPlaying])

   return (
      <>
         <Box
            className="backgroundImageWrapper"
            sx={[
               styles.backgroundImageWrapperRecording,
               bottomElement && styles.backgroundImageWrapperWithBottomContent,
            ]}
         >
            {loading || recordingTokenLoading ? (
               <Skeleton
                  animation={animation ?? "wave"}
                  variant="rectangular"
                  sx={styles.backgroundImageLoader}
               />
            ) : recordingNotAvailable ? (
               <NoRecordingHero />
            ) : (
               <VideoPreviewHero
                  preview={preview}
                  onVideoEnded={onVideoEnded}
                  recordingToken={recordingToken}
               />
            )}
         </Box>
         {hideChipLabels || loading ? null : <EventPreviewCardChipLabels />}
      </>
   )
}

const NoRecordingHero = () => {
   const { livestream, startDate } = useEventPreviewCardContext()
   return (
      <>
         <Box sx={styles.noRecordingWrapper}>
            <Image
               alt="Recording Image"
               src={
                  getResizedUrl(livestream?.backgroundImageUrl, "lg") ||
                  placeholderBanner
               }
               fill
               priority
               className="backgroundImage"
               sizes="(max-width: 647px) 100vw, (max-width: 1279px) 50vw, 33vw"
               style={{
                  objectFit: "cover",
                  borderRadius: "8px",
               }}
            />
         </Box>
         <Stack sx={styles.noRecordingText}>
            <Box sx={styles.frownIcon} component={RecordingUnavailableIcon} />
            <Typography variant="small">Recording unavailable</Typography>
            <Typography variant="xsmall" mt={"-2px"}>
               Live {DateUtil.getTimeAgo(startDate)}
            </Typography>
         </Stack>
      </>
   )
}

const VideoPreviewHero = ({
   preview,
   onVideoEnded,
   recordingToken,
}: {
   preview: boolean
   onVideoEnded: () => void
   recordingToken: RecordingToken
}) => {
   const { livestream, startDate, autoPlaying } = useEventPreviewCardContext()
   const { currentPercentage, videoStartPosition, onSecondPassed } =
      useRecordingProgressTracker({
         livestream,
         playing: autoPlaying,
      })

   return (
      <>
         <Box sx={styles.recordingWrapper}>
            <RecordingPreviewCardContainer
               video={{
                  thumbnailUrl: livestream.backgroundImageUrl,
                  url: downloadLinkWithDate(
                     livestream.startDate,
                     livestream.id,
                     recordingToken.sid
                  ),
                  preview: preview,
                  startAt: videoStartPosition,
                  percentWatched: currentPercentage,
               }}
               autoPlaying={autoPlaying}
               onSecondPassed={onSecondPassed}
               onVideoEnded={onVideoEnded}
            />
         </Box>

         {!autoPlaying && (
            <>
               <Box
                  sx={styles.recordingPlayIcon}
                  component={RecordingPlayIcon}
               />
               <Box sx={styles.timestamp}>
                  <Typography variant="small">
                     {DateUtil.getTimeAgo(startDate)}
                  </Typography>
               </Box>
               <Box sx={styles.duration}>
                  <Typography variant="small">
                     {livestream.endedAt
                        ? DateUtil.formatElapsedTime(
                             startDate,
                             livestream.endedAt.toDate()
                          )
                        : DateUtil.formatElapsedTime(
                             startDate,
                             addMinutes(startDate, livestream.duration)
                          )}
                  </Typography>
               </Box>
            </>
         )}
      </>
   )
}
