import { Box, Chip } from "@mui/material"
import { OfflineEventStatus } from "./utils"

type Props = {
   status: OfflineEventStatus
}

export const OfflineEventStatusBadge = ({ status }: Props) => {
   const getStatusConfig = () => {
      switch (status) {
         case OfflineEventStatus.UPCOMING:
            return {
               label: "Upcoming",
               color: "primary" as const,
               variant: "filled" as const,
            }
         case OfflineEventStatus.DRAFT:
            return {
               label: "Draft",
               color: "default" as const,
               variant: "outlined" as const,
            }
         case OfflineEventStatus.PAST:
            return {
               label: "Past",
               color: "secondary" as const,
               variant: "filled" as const,
            }
         default:
            return {
               label: "Unknown",
               color: "default" as const,
               variant: "outlined" as const,
            }
      }
   }

   const config = getStatusConfig()

   return (
      <Box>
         <Chip
            label={config.label}
            color={config.color}
            variant={config.variant}
            size="small"
         />
      </Box>
   )
}
