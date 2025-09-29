import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box, IconButton, Tooltip } from "@mui/material"
import { BarChart, Edit, Eye, Share2 } from "react-feather"
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
   isHovered,
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
         {/* Quick action buttons - only show on hover */}
         {isHovered ? (
            <>
               {isPublished ? (
                  <Tooltip title="View offline event">
                     <IconButton
                        size="small"
                        onClick={() => onViewOfflineEvent(stat)}
                        sx={{ p: 0.5 }}
                     >
                        <Eye size={16} />
                     </IconButton>
                  </Tooltip>
               ) : null}

               {isPublished ? (
                  <Tooltip title="Share offline event">
                     <IconButton
                        size="small"
                        onClick={() => onShareOfflineEvent(stat)}
                        sx={{ p: 0.5 }}
                     >
                        <Share2 size={16} />
                     </IconButton>
                  </Tooltip>
               ) : null}

               <Tooltip title="Analytics">
                  <IconButton
                     size="small"
                     onClick={() => onAnalytics(stat)}
                     sx={{ p: 0.5 }}
                  >
                     <BarChart size={16} />
                  </IconButton>
               </Tooltip>

               <Tooltip title="Edit">
                  <IconButton
                     size="small"
                     onClick={() => onEdit(stat)}
                     sx={{ p: 0.5 }}
                  >
                     <Edit size={16} />
                  </IconButton>
               </Tooltip>
            </>
         ) : null}

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
