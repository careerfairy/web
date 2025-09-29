import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Button, Stack } from "@mui/material"
import { OfflineEventActionsMenu } from "./OfflineEventActionsMenu"
import { OfflineEventStatus } from "./utils"

type Props = {
   stat: OfflineEventsWithStats
   status: OfflineEventStatus
   onViewOfflineEvent: (stat: OfflineEventsWithStats) => void
   onShareOfflineEvent: (stat: OfflineEventsWithStats) => void
   onAnalytics: (stat: OfflineEventsWithStats) => void
   onEdit: (stat: OfflineEventsWithStats) => void
   onViewRegistration: (stat: OfflineEventsWithStats) => void
   onViewDetails: (stat: OfflineEventsWithStats) => void
   onDelete: (stat: OfflineEventsWithStats) => void
}

export const OfflineEventMobileCardActions = ({
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
   const isPublished = stat.offlineEvent.published

   return (
      <Stack
         direction="row"
         spacing={1}
         justifyContent="space-between"
         alignItems="center"
      >
         <Stack direction="row" spacing={1}>
            {isPublished ? (
               <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onViewOfflineEvent(stat)}
               >
                  View
               </Button>
            ) : null}

            <Button
               size="small"
               variant="outlined"
               onClick={() => onEdit(stat)}
            >
               Edit
            </Button>
         </Stack>

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
      </Stack>
   )
}
