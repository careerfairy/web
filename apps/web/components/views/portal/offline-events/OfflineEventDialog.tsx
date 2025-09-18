import { Box, Dialog, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import CircularLogo from "components/views/common/logos/CircularLogo"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import Image from "next/image"
import { Calendar, MapPin, X } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { OfflineEvent } from "./OfflineEventCard"

type Props = {
   open: boolean
   event: OfflineEvent
   onClose: () => void
}

const styles = sxStyles({
   header: {
      position: "relative",
      width: "100%",
      aspectRatio: "3/2",
      overflow: "hidden",
   },
   closeIcon: {
      position: "absolute",
      top: 1,
      right: 1,
      p: 1,
      borderRadius: "50%",
      color: "neutral.800",
      backgroundColor: (theme) => theme.brand.white[100],
      cursor: "pointer",
      zIndex: 1,
      "& svg": {
         width: 20,
         height: 20,
      },
   },
   content: {
      p: 3,
      gap: 2,
   },
   title: {
      color: "neutral.900",
   },
   companyRow: {
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   metaRow: {
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   icon: {
      color: "neutral.700",
      width: 18,
      height: 18,
      flexShrink: 0,
   },
   text: {
      color: "neutral.700",
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      transition: (theme) => theme.transitions.create("max-width"),
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      height: "100%",
   },
})

export const OfflineEventDialog = ({ open, event, onClose }: Props) => {
   const isMobile = useIsMobile()
   return (
      <Dialog
         open={open}
         onClose={onClose}
         TransitionComponent={
            isMobile ? SlideLeftTransition : SlideUpTransition
         }
         maxWidth="md"
         fullWidth
         fullScreen={isMobile}
         closeAfterTransition={true}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
         sx={{
            ...NICE_SCROLLBAR_STYLES,
         }}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         <Content event={event} onClose={onClose} />
      </Dialog>
   )
}

const Content = ({
   event,
   onClose,
}: {
   event: OfflineEvent
   onClose: () => void
}) => {
   const {
      bannerUrl,
      title,
      companyLogoUrl,
      companyName,
      location,
      dateLabel,
   } = event || {}

   return (
      <Box>
         <Box sx={styles.header}>
            <Box component={X} sx={styles.closeIcon} onClick={onClose} />
            <Image
               src={bannerUrl}
               alt={`${title} banner`}
               fill
               style={{ objectFit: "cover" }}
               priority
            />
         </Box>

         <Stack sx={styles.content}>
            <Stack direction="row" sx={styles.companyRow}>
               <CircularLogo src={companyLogoUrl} alt={`${companyName} logo`} />
               <Typography variant="brandedBody" color="neutral.800">
                  {companyName}
               </Typography>
            </Stack>

            <Typography variant="brandedH4" sx={styles.title} fontWeight={700}>
               {title}
            </Typography>

            <Stack direction="row" sx={styles.metaRow}>
               <Box component={MapPin} sx={styles.icon} />
               <Typography variant="medium" sx={styles.text}>
                  {location}
               </Typography>
            </Stack>

            <Stack direction="row" sx={styles.metaRow}>
               <Box component={Calendar} sx={styles.icon} />
               <Typography variant="medium" sx={styles.text}>
                  {dateLabel}
               </Typography>
            </Stack>
         </Stack>
      </Box>
   )
}
