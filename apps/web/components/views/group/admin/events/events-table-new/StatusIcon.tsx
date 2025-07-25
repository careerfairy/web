import { Box } from "@mui/material"
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
         return <File size={20} color="#FE9B0E" style={{ flexShrink: 0 }} />
      }

      // Check if it's a past event
      if (isPastEvent) {
         // Check if recording is available
         if (denyRecordingAccess) {
            return (
               <VideoOff size={20} color="#ADADC1" style={{ flexShrink: 0 }} />
            )
         }
         return <Video size={20} color="#7A7A8E" style={{ flexShrink: 0 }} />
      }

      // Published/upcoming event
      return <CheckCircle size={20} color="#00BD40" style={{ flexShrink: 0 }} />
   }

   return <Box p={1}>{getIcon()}</Box>
}
