import { Box, IconButton } from "@mui/material"
import { ShareArrowIconOutlined } from "components/views/common/icons/ShareArrowIconOutlined"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { BarChart } from "react-feather"

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
         {isPublished && onAnalytics ? (
            <BrandedTooltip title="Analytics" placement="bottom">
               <IconButton
                  size="small"
                  onClick={(e) => {
                     e.stopPropagation()
                     onAnalytics()
                  }}
                  sx={{ p: 0.5 }}
               >
                  <BarChart size={16} />
               </IconButton>
            </BrandedTooltip>
         ) : null}
      </Box>
   )
}
