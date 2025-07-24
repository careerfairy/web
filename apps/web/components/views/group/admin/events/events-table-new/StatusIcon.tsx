import { Box } from "@mui/material"
import { CheckCircle, File, Video, VideoOff } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 80,
   },
})

interface StatusIconProps {
   isDraft?: boolean
   hasEnded?: boolean
   start?: any // Firebase timestamp
   denyRecordingAccess?: boolean
}

export const StatusIcon = ({
   isDraft,
   hasEnded,
   start,
   denyRecordingAccess,
}: StatusIconProps) => {
   const getIcon = () => {
      if (isDraft) {
         return <File size={20} color="#FE9B0E" style={{ flexShrink: 0 }} />
      }

      // Check if it's a past event
      if (hasEnded || (start && new Date(start.toDate()) < new Date())) {
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

   return <Box sx={styles.container}>{getIcon()}</Box>
}
