import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box, Card, CardContent, Stack, Typography } from "@mui/material"
import { format } from "date-fns"
import { OfflineEventMobileCardActions } from "./OfflineEventMobileCardActions"
import { OfflineEventStatusBadge } from "./OfflineEventStatusBadge"
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
}

export const OfflineEventMobileCard = ({
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
}: Props) => {
   const title = stat.offlineEvent.title || "No title"

   const formatDate = (timestamp: any) => {
      if (!timestamp?.toDate) return "No date"
      try {
         return format(timestamp.toDate(), "MMM dd, yyyy")
      } catch {
         return "Invalid date"
      }
   }

   const startDate = formatDate(stat.offlineEvent.startAt)

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
      <Card
         onMouseEnter={() => onMouseEnter(statKey)}
         onMouseLeave={onMouseLeave}
         sx={{
            "&:hover": {
               boxShadow: 2,
            },
         }}
      >
         <CardContent>
            <Stack spacing={2}>
               <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
               >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                     <Typography
                        variant="brandedBody"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                           whiteSpace: "nowrap",
                        }}
                     >
                        {title}
                     </Typography>
                     <Typography
                        variant="small"
                        color="text.secondary"
                        mt={0.5}
                     >
                        {startDate}
                     </Typography>
                  </Box>
                  <OfflineEventStatusBadge status={status} />
               </Stack>

               <Stack direction="row" spacing={3}>
                  <Box>
                     <Typography variant="small" color="text.secondary">
                        {stat.stats?.totalClicks ?? 0} clicks
                     </Typography>
                  </Box>
                  <Box>
                     <Typography variant="small" color="text.secondary">
                        {stat.stats?.totalViews ?? 0} views
                     </Typography>
                  </Box>
               </Stack>

               <OfflineEventMobileCardActions
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
         </CardContent>
      </Card>
   )
}
