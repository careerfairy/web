import { Box, IconButton, Tooltip } from "@mui/material"
import { BarChart, Edit, Share2 } from "react-feather"

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
         {/* Share button - only show for published events */}
         {isPublished && onShareOfflineEvent ? (
            <Tooltip title="Share offline event">
               <IconButton
                  size="small"
                  onClick={(e) => {
                     e.stopPropagation()
                     onShareOfflineEvent()
                  }}
                  sx={{ p: 0.5 }}
               >
                  <Share2 size={16} />
               </IconButton>
            </Tooltip>
         ) : null}

         {/* Analytics button - only show for published events */}
         {isPublished && onAnalytics ? (
            <Tooltip title="Analytics">
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
            </Tooltip>
         ) : null}

         {/* Edit button - always available */}
         {onEdit ? (
            <Tooltip title="Edit">
               <IconButton
                  size="small"
                  onClick={(e) => {
                     e.stopPropagation()
                     onEdit()
                  }}
                  sx={{ p: 0.5 }}
               >
                  <Edit size={16} />
               </IconButton>
            </Tooltip>
         ) : null}
      </Box>
   )
}
