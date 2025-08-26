import { ImpressionLocation, LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Typography } from "@mui/material"
import { forwardRef } from "react"

export type CustomLivestreamCardProps = {
   event?: LivestreamEvent
   location?: ImpressionLocation | string
   disableClick?: boolean
}

const CustomLivestreamCard = forwardRef<HTMLDivElement, CustomLivestreamCardProps>(
   ({ event }, ref) => {
      if (!event) {
         return null
      }

      return (
         <Box ref={ref} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
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