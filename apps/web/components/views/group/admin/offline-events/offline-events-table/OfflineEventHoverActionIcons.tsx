import { Box, IconButton } from "@mui/material"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { BarChart2, Edit2 } from "react-feather"
import { withStopPropagation } from "util/CommonUtil"

const HIDE_ANALYTICS = true

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
      <Box
         sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
            px: 1,
         }}
      >
         {Boolean(onEdit) && (
            <BrandedTooltip title="Edit" placement="top" disableInteractive>
               <IconButton
                  sx={{ p: 0.5 }}
                  onClick={withStopPropagation(onEdit)}
               >
                  <Edit2 size={16} />
               </IconButton>
            </BrandedTooltip>
         )}
         {/* Share button - only show for published events */}
         {isPublished && onShareOfflineEvent ? (
            <BrandedTooltip title="Share offline event" placement="bottom">
               <IconButton
                  size="small"
                  onClick={(e) => {
                     e.stopPropagation()
                     onShareOfflineEvent()
                  }}
                  sx={{ p: 0.5 }}
               >
                  <ShareArrowIconOutlined />
               </IconButton>
            </BrandedTooltip>
         ) : null}

         {/* Analytics button - only show for published events */}
         {isPublished && onAnalytics && !HIDE_ANALYTICS ? (
            <BrandedTooltip title="Analytics" placement="bottom">
               <IconButton
                  size="small"
                  onClick={(e) => {
                     e.stopPropagation()
                     onAnalytics()
                  }}
                  sx={{ p: 0.5 }}
               >
                  <BarChart2 size={16} />
               </IconButton>
            </BrandedTooltip>
         ) : null}
      </Box>
   )
}
