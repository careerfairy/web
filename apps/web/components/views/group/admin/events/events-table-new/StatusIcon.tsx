import { Box } from "@mui/material"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { CheckCircle, File, Video, VideoOff } from "react-feather"
import { LivestreamEventStatus } from "./utils"

type Props = {
   status: LivestreamEventStatus
   size: number
}

export const StatusIcon = ({ status, size }: Props) => {
   const getIcon = () => {
      switch (status) {
         case LivestreamEventStatus.DRAFT:
            return <Box component={File} size={size} color="warning.600" />
         case LivestreamEventStatus.NOT_RECORDED:
            return <Box component={VideoOff} size={size} color="neutral.300" />
         case LivestreamEventStatus.RECORDING:
            return <Box component={Video} size={size} color="neutral.500" />
         default:
            // Published/upcoming event
            return (
               <Box component={CheckCircle} size={size} color="success.700" />
            )
      }
   }

   const getTooltipTitle = () => {
      switch (status) {
         case LivestreamEventStatus.DRAFT:
            return "Draft"
         case LivestreamEventStatus.RECORDING:
            return "Recorded"
         case LivestreamEventStatus.NOT_RECORDED:
            return "Recording not available"
         case LivestreamEventStatus.UPCOMING:
            return "Upcoming"
         default:
            return "Unknown"
      }
   }

   return (
      <BrandedTooltip
         title={getTooltipTitle()}
         placement="top"
         offset={[0, -5]}
         disableInteractive
      >
         {getIcon()}
      </BrandedTooltip>
   )
}
