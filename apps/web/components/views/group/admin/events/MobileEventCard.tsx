import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { ButtonBase, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { placeholderBanner } from "constants/images"
import Image from "next/image"
import { Calendar, Eye, User } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { checkIfPast } from "util/streamUtil"
import { StatusIcon } from "./events-table-new/StatusIcon"
import { getEventDate } from "./events-table-new/utils"

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

type Props = {
   stat: LiveStreamStats
   onCardClick: () => void
}

export const MobileEventCard = ({ stat, onCardClick }: Props) => {
   const isPastEvent = checkIfPast(stat.livestream)

   return (
      <ButtonBase sx={styles.eventCard} onClick={onCardClick} disableRipple>
         <Stack direction="row" spacing={1}>
            <Image
               src={stat.livestream.backgroundImageUrl || placeholderBanner}
               alt={stat.livestream.title || "Livestream thumbnail"}
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
                  {stat.livestream.title || "Untitled"}
               </Typography>
               <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  color="neutral.600"
               >
                  <Calendar size={14} />
                  <Typography variant="xsmall">{getEventDate(stat)}</Typography>
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
               <User size={14} />
               <Typography variant="xsmall">
                  {stat.generalStats.numberOfRegistrations}
               </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
               <Eye size={14} />
               <Typography variant="xsmall">
                  {stat.generalStats.numberOfParticipants || "-"}
               </Typography>
            </Stack>
            <StatusIcon
               isDraft={stat.livestream.isDraft}
               isPastEvent={isPastEvent}
               hasRecordingAvailable={!stat.livestream.denyRecordingAccess}
               size={14}
            />
         </Stack>
      </ButtonBase>
   )
}
