import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box } from "@mui/material"
import { OfflineEventActionsMenu } from "./OfflineEventActionsMenu"
import { OfflineEventStatus } from "./utils"

type Props = {
   stat: OfflineEventsWithStats
   status: OfflineEventStatus
   isHovered: boolean
   onViewOfflineEvent: (stat: OfflineEventsWithStats) => void
   onShareOfflineEvent: (stat: OfflineEventsWithStats) => void
   onAnalytics: (stat: OfflineEventsWithStats) => void
   onEdit: (stat: OfflineEventsWithStats) => void
   onViewRegistration: (stat: OfflineEventsWithStats) => void
   onViewDetails: (stat: OfflineEventsWithStats) => void
   onDelete: (stat: OfflineEventsWithStats) => void
}

export const OfflineEventTableRowActions = ({
   stat,
   status,
   onViewOfflineEvent,
   onShareOfflineEvent,
   onAnalytics,
   onEdit,
   onViewRegistration,
   onViewDetails,
   onDelete,
}: Props) => {
   return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
         {/* More actions menu */}
         <OfflineEventActionsMenu
            stat={stat}
            status={status}
            onViewOfflineEvent={onViewOfflineEvent}
            onShareOfflineEvent={onShareOfflineEvent}
            onAnalytics={onAnalytics}
            onEdit={onEdit}
            onViewRegistration={onViewRegistration}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
         />
      </Box>
   )
}
