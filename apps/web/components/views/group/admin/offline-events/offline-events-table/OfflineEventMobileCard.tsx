import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { ButtonBase, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { Calendar, Eye, MousePointer } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { OfflineEventStatusBadge } from "./OfflineEventStatusBadge"
import { getOfflineEventStatus } from "./utils"

type Props = {
   stat: OfflineEventsWithStats
   onCardClick: () => void
}

const styles = sxStyles({
   eventCard: {
      height: 109,
      p: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      backgroundColor: (theme) => theme.brand.white[100],
      textAlign: "left",
      verticalAlign: "top",
      alignItems: "flex-start",
   },
   image: {
      borderRadius: "8px",
      objectFit: "cover",
      flexShrink: 0,
   },
   statsRow: {
      color: "neutral.600",
      width: "100%",
      "& svg": {
         width: 14,
         height: 14,
      },
   },
})

export const OfflineEventMobileCard = ({ stat, onCardClick }: Props) => {
   const status = getOfflineEventStatus(stat.offlineEvent)

   const formatDate = (timestamp: any) => {
      if (!timestamp?.toDate) return "No date"
      try {
         return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit",
         }).format(timestamp.toDate())
      } catch {
         return "Invalid date"
      }
   }

   const eventDate = formatDate(stat.offlineEvent.startAt)

   return (
      <ButtonBase sx={styles.eventCard} onClick={onCardClick} disableRipple>
         <Stack direction="row" spacing={1}>
            <Image
               src={stat.offlineEvent.backgroundImageUrl || placeholderBanner}
               alt={stat.offlineEvent.title || "Offline event thumbnail"}
               width={96}
               height={53}
               style={styles.image}
            />
            <Stack spacing={0.5}>
               <Typography
                  variant="medium"
                  sx={getMaxLineStyles(2)}
                  color="neutral.800"
               >
                  {stat.offlineEvent.title || "Untitled"}
               </Typography>
               <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
               >
                  <Calendar size={14} />
                  <Typography variant="xsmall">{eventDate}</Typography>
               </Stack>
            </Stack>
         </Stack>

         <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={styles.statsRow}
         >
            <Stack direction="row" alignItems="center" spacing={1}>
               <Eye size={14} />
               <Typography variant="xsmall">
                  {stat.stats?.totalViews ?? 0}
               </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
               <MousePointer size={14} />
               <Typography variant="xsmall">
                  {stat.stats?.totalClicks ?? 0}
               </Typography>
            </Stack>
            <OfflineEventStatusBadge status={status} />
         </Stack>
      </ButtonBase>
   )
}
