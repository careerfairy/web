import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { HoverActionIcons } from "./HoverActionIcons"
import { SpeakerAvatars } from "./SpeakerAvatars"
import { getEventActionConditions } from "./utils"

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
      position: "relative",
   },
   titleTextDefault: {
      ...getMaxLineStyles(2), // 2 lines by default
   },
   titleTextHovered: {
      ...getMaxLineStyles(1), // 1 line when hovered
      overflow: "visible",
   },
   hoverActionsBackground: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 32,
      backgroundColor: (theme) => theme.brand.white[200],
      animation: "fadeInBackground 0.2s ease-in-out forwards",
      "@keyframes fadeInBackground": {
         "0%": {
            backgroundColor: (theme) => theme.brand.white[200],
         },
         "100%": {
            backgroundColor: (theme) => theme.brand.white[400],
         },
      },
   },
   speakerAvatarsContainer: {
      width: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
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
   // Use centralized condition logic
   const {
      shouldShowEnterLiveStreamRoom,
      shouldShowShareLiveStream,
      shouldShowAnalytics,
      shouldShowQuestions,
      shouldShowFeedback,
      shouldShowShareRecording,
   } = getEventActionConditions({
      isDraft,
      isPastEvent,
      hasRecordingAvailable,
   })

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
               sx={styles.contentContainer}
               py={showHoverActions ? undefined : 1}
               pt={showHoverActions ? 1 : undefined}
               justifyContent="space-between"
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
                  <Box sx={styles.hoverActionsBackground}>
                     <HoverActionIcons
                        onEdit={isDraft ? onEdit : undefined}
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
                        onAnalytics={
                           shouldShowAnalytics ? onAnalytics : undefined
                        }
                        onQuestions={
                           shouldShowQuestions ? onQuestions : undefined
                        }
                        onFeedback={shouldShowFeedback ? onFeedback : undefined}
                        onShareRecording={
                           shouldShowShareRecording
                              ? onShareRecording
                              : undefined
                        }
                     />
                  </Box>
               )}
            </Stack>
         </Box>
         <Box sx={styles.speakerAvatarsContainer}>
            <SpeakerAvatars maxVisible={3} speakers={speakers} />
         </Box>
      </Stack>
   )
}
