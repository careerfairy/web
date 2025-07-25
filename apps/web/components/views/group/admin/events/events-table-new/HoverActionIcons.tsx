import { Box, IconButton } from "@mui/material"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import {
   BarChart2,
   Copy,
   ExternalLink,
   MessageSquare,
   ThumbsUp,
} from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      gap: 1.5,
      p: 0,
      height: 32, // Fixed height to prevent expansion
      alignItems: "center",
      maxWidth: 318, // Match Figma width
   },
   iconButton: {
      p: 0.75,
      borderRadius: "83px", // Fully rounded as shown in Figma
      color: "neutral.600", // #5C5C6A color from Figma
      backgroundColor: "transparent",
      width: 32,
      height: 32,
      "&:hover": {
         backgroundColor: "neutral.50",
      },
   },
})

type Props = {
   onExternalLink?: () => void
   onCopy?: () => void
   onAnalytics?: () => void
   onMessage?: () => void
   onFeedback?: () => void
   showFeedback?: boolean
}

export const HoverActionIcons = ({
   onExternalLink,
   onCopy,
   onAnalytics,
   onMessage,
   onFeedback,
   showFeedback = false,
}: Props) => {
   return (
      <Box sx={styles.container}>
         {Boolean(onExternalLink) && (
            <BrandedTooltip title="Enter live stream room" placement="top">
               <IconButton sx={styles.iconButton} onClick={onExternalLink}>
                  <ExternalLink size={20} />
               </IconButton>
            </BrandedTooltip>
         )}
         <BrandedTooltip title="Share Live stream" placement="top">
            <IconButton sx={styles.iconButton} onClick={onCopy}>
               <Copy size={20} />
            </IconButton>
         </BrandedTooltip>
         <BrandedTooltip title="Analytics" placement="top">
            <IconButton sx={styles.iconButton} onClick={onAnalytics}>
               <BarChart2 size={20} />
            </IconButton>
         </BrandedTooltip>
         <BrandedTooltip title="Questions" placement="top">
            <IconButton sx={styles.iconButton} onClick={onMessage}>
               <MessageSquare size={20} />
            </IconButton>
         </BrandedTooltip>
         {Boolean(showFeedback && onFeedback) && (
            <BrandedTooltip title="Feedback" placement="top">
               <IconButton sx={styles.iconButton} onClick={onFeedback}>
                  <ThumbsUp size={20} />
               </IconButton>
            </BrandedTooltip>
         )}
      </Box>
   )
}
