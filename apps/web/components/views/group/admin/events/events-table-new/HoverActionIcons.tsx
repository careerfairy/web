import { IconButton } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { FeedbackIcon } from "components/views/common/icons/FeedbackIcon"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { BarChart2, Edit2, ExternalLink, MessageSquare } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { withStopPropagation } from "util/CommonUtil"

const styles = sxStyles({
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
      alignItems: "center",
   },
})

// Simple container animation
const containerVariants = {
   hidden: {
      opacity: 0,
      y: 5,
   },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         type: "spring",
         stiffness: 800,
         damping: 30,
         duration: 0.1,
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
      <FramerBox
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         sx={styles.motionContainer}
      >
         {Boolean(onEdit) && (
            <BrandedTooltip title="Edit" placement="top" disableInteractive>
               <IconButton
                  data-testid="hover-action-edit"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onEdit)}
               >
                  <Edit2 />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onEnterLiveStreamRoom) && (
            <BrandedTooltip
               title="Enter live stream room"
               placement="top"
               disableInteractive
            >
               <IconButton
                  data-testid="hover-action-enter-livestream"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onEnterLiveStreamRoom)}
               >
                  <ExternalLink />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onShareLiveStream) && (
            <BrandedTooltip
               title="Share Live stream"
               placement="top"
               disableInteractive
            >
               <IconButton
                  data-testid="hover-action-share-livestream"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onShareLiveStream)}
               >
                  <ShareArrowIconOutlined />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onShareRecording) && (
            <BrandedTooltip
               title="Share recording"
               placement="top"
               disableInteractive
            >
               <IconButton
                  data-testid="hover-action-share-recording"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onShareRecording)}
               >
                  <ShareArrowIconOutlined />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onAnalytics) && (
            <BrandedTooltip
               title="Analytics"
               placement="top"
               disableInteractive
            >
               <IconButton
                  data-testid="hover-action-analytics"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onAnalytics)}
               >
                  <BarChart2 />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onQuestions) && (
            <BrandedTooltip
               title="Questions"
               placement="top"
               disableInteractive
            >
               <IconButton
                  data-testid="hover-action-questions"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onQuestions)}
               >
                  <MessageSquare />
               </IconButton>
            </BrandedTooltip>
         )}
         {Boolean(onFeedback) && (
            <BrandedTooltip title="Feedback" placement="top" disableInteractive>
               <IconButton
                  data-testid="hover-action-feedback"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onFeedback)}
               >
                  <FeedbackIcon />
               </IconButton>
            </BrandedTooltip>
         )}
      </FramerBox>
   )
}
