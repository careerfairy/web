import { Box, Theme } from "@mui/material"
import TimeHistory from "components/views/common/icons/TimeHistory"
import { CheckCircle, File } from "react-feather"
import { OfflineEventStatus } from "./utils"

const STATUS_ICONS = {
   [OfflineEventStatus.UPCOMING]: {
      icon: CheckCircle,
      color: (theme: Theme) => theme.brand.success[700],
   },
   [OfflineEventStatus.DRAFT]: {
      icon: File,
      color: (theme: Theme) => theme.brand.warning[600],
   },
   [OfflineEventStatus.PAST]: {
      icon: TimeHistory,
      color: (theme: Theme) => theme.palette.text.secondary,
   },
}

type Props = {
   status: OfflineEventStatus
}

export const OfflineEventStatusBadge = ({ status }: Props) => {
   if (!STATUS_ICONS[status]) {
      return null
   }

   return (
      <Box
         component={STATUS_ICONS[status].icon}
         size={20}
         width={20}
         height={20}
         color={STATUS_ICONS[status].color}
      />
   )
}
