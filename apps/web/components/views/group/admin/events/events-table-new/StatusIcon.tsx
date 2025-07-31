import { Box } from "@mui/material"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { CheckCircle, File, Video, VideoOff } from "react-feather"
import { LivestreamEventStatus } from "./utils"

type Props = {
   status: LivestreamEventStatus
}

export const StatusIcon = ({ status }: Props) => {
   const getIcon = () => {
      switch (status) {
         case LivestreamEventStatus.DRAFT:
            return <Box component={File} size={20} color="warning.600" />
         case LivestreamEventStatus.NOT_RECORDED:
            return <Box component={VideoOff} size={20} color="neutral.300" />
         case LivestreamEventStatus.RECORDING:
            return <Box component={Video} size={20} color="neutral.500" />
         default:
            // Published/upcoming event
            return <Box component={CheckCircle} size={20} color="success.700" />
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
