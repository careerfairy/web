import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Typography } from "@mui/material"
import { forwardRef } from "react"

export type CustomLivestreamCardProps = {
   event?: LivestreamEvent
   location?: string
   disableClick?: boolean
}

const CustomLivestreamCard = forwardRef<HTMLDivElement, CustomLivestreamCardProps>(
   ({ event }, ref) => {
      if (!event) {
         return (
            <Box ref={ref} p={2}>
               <Typography>No event data</Typography>
            </Box>
         )
      }

      return (
         <Box ref={ref} p={2} sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h6">{event.title || "Untitled Live Stream"}</Typography>
            <Typography variant="body2" color="text.secondary">
               {event.summary || "No summary available"}
            </Typography>
         </Box>
      )
   }
)

CustomLivestreamCard.displayName = "CustomLivestreamCard"

export default CustomLivestreamCard