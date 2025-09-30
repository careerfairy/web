import { Box, Stack, Typography } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { format } from "date-fns"

type Props = {
   stat: OfflineEventsWithStats
   onClicksClick: (stat: OfflineEventsWithStats) => void
   onViewsClick: (stat: OfflineEventsWithStats) => void
}

export const OfflineEventTableRowContent = ({
   stat,
   onClicksClick,
   onViewsClick,
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

   return (
      <Stack spacing={1}>
         <Box>
            <Typography
               variant="brandedBody"
               fontWeight={600}
               color="text.primary"
               sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 300,
               }}
            >
               {title}
            </Typography>
            <Typography variant="small" color="text.secondary">
               {startDate}
            </Typography>
         </Box>

         <Stack direction="row" spacing={3}>
            <Box sx={{ cursor: "pointer" }} onClick={() => onClicksClick(stat)}>
               <Typography
                  variant="small"
                  color="text.secondary"
                  sx={{ textDecoration: "underline" }}
               >
                  {stat.stats?.totalClicks ?? 0} clicks
               </Typography>
            </Box>
            <Box sx={{ cursor: "pointer" }} onClick={() => onViewsClick(stat)}>
               <Typography
                  variant="small"
                  color="text.secondary"
                  sx={{ textDecoration: "underline" }}
               >
                  {stat.stats?.totalViews ?? 0} views
               </Typography>
            </Box>
         </Stack>
      </Stack>
   )
}
