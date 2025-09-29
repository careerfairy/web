import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { TableCell, TableRow } from "@mui/material"
import { useCallback } from "react"
import { useSelector } from "react-redux"
import { selectIsRowHovered } from "../../../../../../store/selectors/eventsTableSelectors"
import { OfflineEventStatusBadge } from "./OfflineEventStatusBadge"
import { OfflineEventTableRowActions } from "./OfflineEventTableRowActions"
import { OfflineEventTableRowContent } from "./OfflineEventTableRowContent"
import { OfflineEventStatus } from "./utils"

type Props = {
   stat: OfflineEventsWithStats
   statKey: string
   onMouseEnter: (statKey: string) => void
   onMouseLeave: () => void
   onViewOfflineEvent: (stat: OfflineEventsWithStats) => void
   onShareOfflineEvent: (stat: OfflineEventsWithStats) => void
   onAnalytics: (stat: OfflineEventsWithStats) => void
   onEdit: (stat: OfflineEventsWithStats) => void
   onViewRegistration: (stat: OfflineEventsWithStats) => void
   onViewDetails: (stat: OfflineEventsWithStats) => void
   onDelete: (stat: OfflineEventsWithStats) => void
   onClicksClick: (stat: OfflineEventsWithStats) => void
   onViewsClick: (stat: OfflineEventsWithStats) => void
}

export const OfflineEventTableRow = ({
   stat,
   statKey,
   onMouseEnter,
   onMouseLeave,
   onViewOfflineEvent,
   onShareOfflineEvent,
   onAnalytics,
   onEdit,
   onViewRegistration,
   onViewDetails,
   onDelete,
   onClicksClick,
   onViewsClick,
}: Props) => {
   const isHovered = useSelector(selectIsRowHovered(statKey))

   const handleMouseEnter = useCallback(() => {
      onMouseEnter(statKey)
   }, [onMouseEnter, statKey])

   const handleMouseLeave = useCallback(() => {
      onMouseLeave()
   }, [onMouseLeave])

   // Get the status for this offline event
   const getStatus = (): OfflineEventStatus => {
      if (!stat.offlineEvent.published) {
         return OfflineEventStatus.DRAFT
      }

      if (
         stat.offlineEvent.startAt?.toDate &&
         stat.offlineEvent.startAt.toDate() > new Date()
      ) {
         return OfflineEventStatus.UPCOMING
      }

      return OfflineEventStatus.PAST
   }

   const status = getStatus()

   return (
      <TableRow
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         sx={{
            "&:hover": {
               backgroundColor: "action.hover",
            },
         }}
      >
         <TableCell>
            <OfflineEventTableRowContent
               stat={stat}
               onClicksClick={onClicksClick}
               onViewsClick={onViewsClick}
            />
         </TableCell>
         <TableCell>
            <OfflineEventStatusBadge status={status} />
         </TableCell>
         <TableCell>
            <OfflineEventTableRowActions
               stat={stat}
               status={status}
               isHovered={isHovered}
               onViewOfflineEvent={onViewOfflineEvent}
               onShareOfflineEvent={onShareOfflineEvent}
               onAnalytics={onAnalytics}
               onEdit={onEdit}
               onViewRegistration={onViewRegistration}
               onViewDetails={onViewDetails}
               onDelete={onDelete}
            />
         </TableCell>
      </TableRow>
   )
}
