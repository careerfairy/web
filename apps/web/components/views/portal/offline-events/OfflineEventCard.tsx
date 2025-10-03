import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box, Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { Calendar, MapPin } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { OFFLINE_EVENT_DIALOG_KEY } from "./OfflineEventDialog"

const styles = sxStyles({
   card: {
      width: "100%",
      backgroundColor: (theme) => theme.brand.white[100],
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
      borderRadius: "12px",
      overflow: "hidden",
      transition: (theme) => theme.transitions.create(["box-shadow", "border"]),
      "&:hover,&:focus": {
         border: (theme) => `1px solid ${theme.palette.secondary[100]}`,
         boxShadow: "0 0 12px 0 rgba(20, 20, 20, 0.08)",
      },
   },
   bannerWrapper: {
      position: "relative",
      width: "100%",
      aspectRatio: "3/2",
   },
   content: {
      pt: 0,
      pb: 2,
      px: 0,
   },
   row: {
      px: 2,
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   companyName: {
      color: "neutral.800",
   },
   title: {
      px: 2,
      color: "neutral.800",
      height: "47px",
      ...getMaxLineStyles(2),
   },
   detailRow: {
      px: 2,
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   icon: {
      color: "neutral.700",
      width: 16,
      height: 16,
      flexShrink: 0,
   },
   detailText: {
      color: "neutral.700",
      ...getMaxLineStyles(1),
   },
})

type Props = {
   event: OfflineEvent
}

export const OfflineEventCard = ({ event }: Props) => {
   const { pathname } = useRouter()
   const { backgroundImageUrl, group, title, address, startAt } = event

   return (
      <Box
         component={Link}
         href={{
            pathname,
            query: {
               [OFFLINE_EVENT_DIALOG_KEY]: event.id,
            },
         }}
         scroll={false}
         sx={styles.card}
         data-name="Offline event card"
      >
         <Box sx={styles.bannerWrapper}>
            <Image
               src={backgroundImageUrl}
               alt={`${title} banner`}
               fill
               style={{ objectFit: "cover" }}
               priority
            />
         </Box>

         <Stack sx={styles.content}>
            <Box sx={styles.row} pt={1}>
               <CircularLogo
                  src={group?.logoUrl || ""}
                  alt={`${group.universityName} logo`}
                  size={28}
               />
               <Typography variant="brandedBody" sx={styles.companyName}>
                  {group.universityName}
               </Typography>
            </Box>

            <Typography
               mt={1}
               variant="brandedBody"
               sx={styles.title}
               fontWeight={600}
            >
               {title}
            </Typography>

            <Box pt={1} sx={styles.detailRow}>
               <Box component={MapPin} sx={styles.icon} />
               <Typography variant="small" sx={styles.detailText}>
                  {address?.city}, {address?.state}
               </Typography>
            </Box>

            <Box pt={1} sx={styles.detailRow}>
               <Box component={Calendar} sx={styles.icon} />
               <Typography variant="small" sx={styles.detailText}>
                  {DateUtil.getPrettyDateWithoutHourDayjs(startAt.toDate())}
               </Typography>
            </Box>
         </Stack>
      </Box>
   )
}
