import { IconButton } from "@mui/material"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { motion } from "framer-motion"
import {
   BarChart2,
   Copy,
   Edit2,
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
      "& svg": {
         width: 20,
         height: 20,
         fontSize: 20,
      },
   },
   motionContainer: {
      display: "flex",
      gap: "12px",
      padding: 0,
      height: 32,
      alignItems: "center",
   },
})

// Simple container animation
const containerVariants = {
   hidden: {
      opacity: 0,
      y: 10,
   },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         type: "spring",
         stiffness: 300,
         damping: 20,
      },
   },
}

type Props = {
   onEnterLiveStreamRoom?: () => void
   onShareLiveStream?: () => void
   onShareRecording?: () => void
   onAnalytics?: () => void
   onQuestions?: () => void
   onFeedback?: () => void
   onEdit?: () => void
}

export const HoverActionIcons = ({
   onEnterLiveStreamRoom,
   onShareLiveStream,
   onShareRecording,
   onAnalytics,
   onQuestions,
   onFeedback,
   onEdit,
}: Props) => {
   return (
      <motion.div
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         style={styles.motionContainer}
      >
         {Boolean(onEdit) && (
            <BrandedTooltip title="Edit" placement="top">
               <IconButton sx={styles.iconButton} onClick={onEdit}>
                  <Edit2 />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onEnterLiveStreamRoom) && (
            <BrandedTooltip title="Enter live stream room" placement="top">
               <IconButton
                  sx={styles.iconButton}
                  onClick={onEnterLiveStreamRoom}
               >
                  <ExternalLink />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onShareLiveStream) && (
            <BrandedTooltip title="Share Live stream" placement="top">
               <IconButton sx={styles.iconButton} onClick={onShareLiveStream}>
                  <Copy />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onShareRecording) && (
            <BrandedTooltip title="Share recording" placement="top">
               <IconButton sx={styles.iconButton} onClick={onShareRecording}>
                  <ShareArrowIconOutlined />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onAnalytics) && (
            <BrandedTooltip title="Analytics" placement="top">
               <IconButton sx={styles.iconButton} onClick={onAnalytics}>
                  <BarChart2 />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onQuestions) && (
            <BrandedTooltip title="Questions" placement="top">
               <IconButton sx={styles.iconButton} onClick={onQuestions}>
                  <MessageSquare />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onFeedback) && (
            <BrandedTooltip title="Feedback" placement="top">
               <IconButton sx={styles.iconButton} onClick={onFeedback}>
                  <ThumbsUp />
               </IconButton>
            </BrandedTooltip>
         )}
      </motion.div>
   )
}
