import { IconButton } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { BarChart2, Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { withStopPropagation } from "util/CommonUtil"

const HIDE_ANALYTICS = true

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
   isPublished: boolean
   onShareOfflineEvent?: () => void
   onAnalytics?: () => void
   onEdit?: () => void
}

export const OfflineEventHoverActionIcons = ({
   isPublished,
   onShareOfflineEvent,
   onAnalytics,
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
         {/* Share button - only show for published events */}
         {isPublished && onShareOfflineEvent ? (
            <BrandedTooltip
               title="Share offline event"
               placement="top"
               disableInteractive
            >
               <IconButton
                  data-testid="hover-action-share-offline-event"
                  sx={styles.iconButton}
                  onClick={withStopPropagation(onShareOfflineEvent)}
               >
                  <ShareArrowIconOutlined />
               </IconButton>
            </BrandedTooltip>
         ) : null}

         {/* Analytics button - only show for published events */}
         {isPublished && onAnalytics && !HIDE_ANALYTICS ? (
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
         ) : null}
      </FramerBox>
   )
}
