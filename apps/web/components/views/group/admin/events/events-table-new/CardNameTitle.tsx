import { Box, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { HoverActionIcons } from "./HoverActionIcons"

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
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between", // Always top-aligned
      height: 64, // Fixed height to prevent expansion
      overflow: "hidden", // Prevent overflow
   },
   titleText: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 400,
      color: "neutral.800",
      mb: 0,
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
   showHoverActions?: boolean
   isDraft?: boolean
   isPastEvent?: boolean
   isNotRecorded?: boolean
   onExternalLink?: () => void
   onCopy?: () => void
   onAnalytics?: () => void
   onMessage?: () => void
   onFeedback?: () => void
}

export const CardNameTitle = ({
   title,
   backgroundImageUrl,
   // showHoverActions,
   isDraft,
   isPastEvent,
   isNotRecorded,
   onExternalLink,
   onCopy,
   onAnalytics,
   onMessage,
   onFeedback,
}: Props) => {
   const showHoverActions = true
   // Determine which actions to show based on status
   const shouldShowExternalLink = !isDraft
   const shouldShowFeedback = isPastEvent && !isNotRecorded

   return (
      <Box sx={styles.container}>
         <Image
            src={backgroundImageUrl || placeholderBanner}
            alt={title || "Livestream thumbnail"}
            width={116}
            height={64}
            style={styles.thumbnailImage}
            quality={100}
         />
         <Box sx={styles.contentContainer}>
            <Typography
               sx={[
                  styles.titleText,
                  showHoverActions
                     ? styles.titleTextHovered
                     : styles.titleTextDefault,
               ]}
            >
               {title || (isDraft ? "Untitled draft" : "Untitled")}
            </Typography>
            {Boolean(showHoverActions) && (
               <HoverActionIcons
                  onExternalLink={
                     shouldShowExternalLink ? onExternalLink : undefined
                  }
                  onCopy={onCopy}
                  onAnalytics={onAnalytics}
                  onMessage={onMessage}
                  onFeedback={onFeedback}
                  showFeedback={shouldShowFeedback}
               />
            )}
         </Box>
      </Box>
   )
}
