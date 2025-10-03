import { Box } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { OfflineEventActionsMenu } from "./OfflineEventActionsMenu"

type Props = {
   stat: OfflineEventsWithStats
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
