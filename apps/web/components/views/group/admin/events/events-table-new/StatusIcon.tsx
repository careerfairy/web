import { Box } from "@mui/material"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { CheckCircle, File, Video, VideoOff } from "react-feather"

type Props = {
   isDraft?: boolean
   isPastEvent?: boolean
   denyRecordingAccess?: boolean
}

export const StatusIcon = ({
   isDraft,
   isPastEvent,
   denyRecordingAccess,
}: Props) => {
   const getIcon = () => {
      if (isDraft) {
         return <Box component={File} size={20} color="warning.600" />
      }

      // Check if it's a past event
      if (isPastEvent) {
         // Check if recording is available
         if (denyRecordingAccess) {
            return <Box component={VideoOff} size={20} color="neutral.300" />
         }
         return <Box component={Video} size={20} color="neutral.500" />
      }

      // Published/upcoming event
      return <Box component={CheckCircle} size={20} color="success.700" />
   }

   const getTooltipTitle = () => {
      if (isDraft) {
         return "Draft"
      }

      if (isPastEvent) {
         if (denyRecordingAccess) {
            return "Recording not available"
         }

         return "Recorded"
      }

      return "Published"
   }

   return (
      <Box p={1}>
         <BrandedTooltip
            title={getTooltipTitle()}
            placement="top"
            offset={[0, -5]}
         >
            {getIcon()}
         </BrandedTooltip>
      </Box>
   )
}
