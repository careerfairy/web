import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { HoverActionIcons } from "./HoverActionIcons"
import { SpeakerAvatars } from "./SpeakerAvatars"

const styles = sxStyles({
   container: {
      display: "flex",
      gap: 1,
      minWidth: 300,
      height: 64, // Fixed height to match thumbnail
   },
   thumbnailImage: {
      borderRadius: "4px",
      objectFit: "cover",
      backgroundColor: "neutral.200",
      flexShrink: 0,
   },
   contentContainer: {
      flex: 1,
      minWidth: 0,
      height: 64, // Fixed height to prevent expansion
      overflow: "hidden", // Prevent overflow
   },
   titleTextDefault: {
      ...getMaxLineStyles(2), // 2 lines by default
   },
   titleTextHovered: {
      ...getMaxLineStyles(1), // 1 line when hovered
      height: 20, // Fixed height when hovered
   },
})

type Props = {
   title?: string
   backgroundImageUrl?: string
   speakers?: Speaker[]
   showHoverActions?: boolean
   isDraft?: boolean
   isPastEvent?: boolean
   hasRecordingAvailable?: boolean
   onEnterLiveStreamRoom?: () => void
   onShareLiveStream?: () => void
   onAnalytics?: () => void
   onQuestions?: () => void
   onFeedback?: () => void
   onEdit?: () => void
   onShareRecording?: () => void
}

export const EventCardPreview = ({
   title,
   backgroundImageUrl,
   speakers,
   showHoverActions,
   isDraft,
   isPastEvent,
   hasRecordingAvailable,
   onEnterLiveStreamRoom,
   onShareLiveStream,
   onAnalytics,
   onQuestions,
   onFeedback,
   onEdit,
   onShareRecording,
}: Props) => {
   // const showHoverActions = true

   // Action icon visibility logic:
   // - Edit: Only visible for Draft events
   // - Enter Live Stream Room: Only for Published (not Draft, not Past)
   // - Share Live Stream: Only for Published (not Draft, not Past)
   // - Analytics: Visible for all except Draft
   // - Questions: Visible for all except Draft
   // - Feedback: Only for Past (not Draft)
   // - Share Recording: Only for Past events with recording available (not Draft)
   const shouldShowEdit = isDraft // Only for Draft
   const shouldShowEnterLiveStreamRoom = !isDraft && !isPastEvent // Only for Published
   const shouldShowShareLiveStream = !isDraft && !isPastEvent // Only for Published
   const shouldShowAnalytics = !isDraft // All except Draft
   const shouldShowQuestions = !isDraft // All except Draft
   const shouldShowFeedback = !isDraft && isPastEvent // Only for Past
   const shouldShowShareRecording =
      !isDraft && isPastEvent && hasRecordingAvailable // Only for past events with recordings

   return (
      <Stack
         direction="row"
         spacing={4}
         width="100%"
         justifyContent="space-between"
      >
         <Box sx={styles.container}>
            <Image
               src={backgroundImageUrl || placeholderBanner}
               alt={title || "Livestream thumbnail"}
               width={116}
               height={64}
               style={styles.thumbnailImage}
               quality={100}
            />
            <Stack
               spacing={0.75}
               sx={styles.contentContainer}
               py={showHoverActions ? undefined : 1}
               pt={showHoverActions ? 1 : undefined}
            >
               <Typography
                  variant="medium"
                  color="neutral.800"
                  fontWeight={400}
                  sx={[
                     showHoverActions
                        ? styles.titleTextHovered
                        : styles.titleTextDefault,
                  ]}
               >
                  {title || "Untitled"}
               </Typography>
               {Boolean(showHoverActions) && (
                  <HoverActionIcons
                     onEdit={shouldShowEdit ? onEdit : undefined}
                     onEnterLiveStreamRoom={
                        shouldShowEnterLiveStreamRoom
                           ? onEnterLiveStreamRoom
                           : undefined
                     }
                     onShareLiveStream={
                        shouldShowShareLiveStream
                           ? onShareLiveStream
                           : undefined
                     }
                     onAnalytics={shouldShowAnalytics ? onAnalytics : undefined}
                     onQuestions={shouldShowQuestions ? onQuestions : undefined}
                     onFeedback={shouldShowFeedback ? onFeedback : undefined}
                     onShareRecording={
                        shouldShowShareRecording ? onShareRecording : undefined
                     }
                  />
               )}
            </Stack>
         </Box>
         <Box
            width={80}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
         >
            <SpeakerAvatars maxVisible={3} speakers={speakers} />
         </Box>
      </Stack>
   )
}
