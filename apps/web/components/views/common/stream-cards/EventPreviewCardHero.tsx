import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Skeleton, Stack, Typography } from "@mui/material"
import {
   addMinutes,
   getResizedUrl,
} from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { useMemo } from "react"
import DateUtil from "util/DateUtil"
import EventPreviewCardChipLabels from "./EventPreviewCardChipLabels"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"
import { RecordingPlayIcon } from "./RecordingPlayIcon"
import { RecordingUnavailableIcon } from "./RecordingUnavailableIcon"
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
   },
   recordingWrapper: {
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
         borderRadius: "8px",
         background:
            "linear-gradient(0deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 100%)",
      },
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
      startDate,
   } = useEventPreviewCardContext()
   return (
      <>
         <Box
            className="backgroundImageWrapper"
            sx={[
               styles.backgroundImageWrapperRecording,
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
                  <Box
                     sx={
                        livestream.denyRecordingAccess
                           ? styles.noRecordingWrapper
                           : styles.recordingWrapper
                     }
                  >
                     <Image
                        alt="Recording Image"
                        src={
                           getResizedUrl(
                              livestream?.backgroundImageUrl,
                              "lg"
                           ) || placeholderBanner
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
                  {livestream.denyRecordingAccess ? (
                     <Stack sx={styles.noRecordingText}>
                        <Box
                           sx={styles.frownIcon}
                           component={RecordingUnavailableIcon}
                        />
                        <Typography variant="small">
                           Recording unavailable
                        </Typography>
                        <Typography variant="xsmall" mt={"-2px"}>
                           Live {DateUtil.getTimeAgo(startDate)}
                        </Typography>
                     </Stack>
                  ) : (
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
            )}
         </Box>
         {hideChipLabels || loading ? null : <EventPreviewCardChipLabels />}
      </>
   )
}
