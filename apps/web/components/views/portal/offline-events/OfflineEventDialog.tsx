import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import {
   Box,
   Button,
   Dialog,
   IconButton,
   Stack,
   Typography,
   alpha,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import SanitizedHTML from "components/util/SanitizedHTML"
import { BasicShareIcon } from "components/views/common/icons/BasicShareIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import { groupRepo } from "data/RepositoryInstances"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from "react-feather"
import useSWR from "swr"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { makeGroupCompanyPageUrl } from "util/makeUrls"

const styles = sxStyles({
   header: {
      position: "relative",
      width: "100%",
      aspectRatio: "3/2",
      overflow: "hidden",
   },
   headerOverlayTop: {
      position: "absolute",
      inset: 0,
      background: (theme) =>
         `linear-gradient(0deg, ${alpha(
            theme.palette.common.black,
            0.2
         )} 0%, ${alpha(theme.palette.common.black, 0.2)} 100%)`,
      pointerEvents: "none",
   },
   headerOverlayBottom: {
      position: "absolute",
      inset: 0,
      background: (theme) =>
         `linear-gradient(180deg, ${alpha(
            theme.palette.common.black,
            0
         )} 73%, ${alpha(theme.palette.common.black, 0.5)} 97%)`,
      pointerEvents: "none",
   },
   iconsContainer: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      p: 1.5,
      width: "100%",
   },
   closeIcon: {
      p: 1,
      color: (theme) => theme.brand.white[100],
      backgroundColor: (theme) => alpha(theme.brand.black[900], 0.5),
      "& svg": {
         width: 20,
         height: 20,
      },
   },
   content: {
      position: "relative",
      p: 1,
      pt: 1.5,
      gap: 1,
      borderRadius: "12px",
      top: -12,
      backgroundColor: (theme) => theme.brand.white[100],
   },
   detailsContainer: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: 1,
      p: 1,
      borderRadius: 2,
      backgroundColor: (theme) => theme.brand.white[300],
   },
   detailCol: {
      display: "flex",
      gap: 1,
      p: 1,
      alignItems: "flex-start",
      flex: 1,
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
   headerText: {
      color: "neutral.800",
      fontWeight: 600,
   },
   organisedContainer: {
      p: 1,
      borderRadius: 2,
      backgroundColor: (theme) => theme.brand.white[300],
      display: "flex",
      flexDirection: "column",
      gap: 1,
   },
   organisedRow: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      width: "100%",
   },
   aboutContainer: {
      p: 1,
      borderRadius: 2,
      backgroundColor: (theme) => theme.brand.white[300],
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
   },
   stickyCta: {
      position: "sticky",
      bottom: 0,
      px: 2,
      pt: 4,
      pb: 2,
      background: (theme) =>
         `linear-gradient(180deg, ${alpha(
            theme.palette.common.white,
            0
         )} 0%, ${alpha(theme.palette.common.white, 0.98)} 78%)`,
      display: "flex",
      justifyContent: "center",
      zIndex: 1,
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      transition: (theme) => theme.transitions.create("max-width"),
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      height: "100%",
      overflow: "auto",
   },
})

type Props = {
   eventFromServer: OfflineEvent
}

export const OfflineEventDialog = ({ eventFromServer }: Props) => {
   const [open, setOpen] = useState(Boolean(eventFromServer))
   const isMobile = useIsMobile()

   const handleClose = useCallback(() => {
      setOpen(false)
   }, [])

   return (
      <Dialog
         open={open}
         onClose={handleClose}
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
         <Content event={eventFromServer} onClose={handleClose} />
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
   const isMobile = useIsMobile()

   const { data: group } = useSWR(
      event?.company?.groupId ? ["group", event.company.groupId] : null,
      () => groupRepo.getGroupById(event?.company?.groupId)
   )

   const companyUrl = group?.publicProfile
      ? makeGroupCompanyPageUrl(group?.universityName, {
           interactionSource: InteractionSources.Offline_Event_Dialog,
        })
      : undefined

   const {
      backgroundImageUrl,
      title,
      company,
      address,
      startAt,
      description,
      registrationUrl,
      industries,
   } = event || {}

   return (
      <Box position="relative">
         <Box sx={styles.header}>
            {backgroundImageUrl ? (
               <Image
                  src={backgroundImageUrl}
                  alt={`${title} banner`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
               />
            ) : null}
            <Box sx={styles.headerOverlayTop} />
            <Box sx={styles.headerOverlayBottom} />
            <Stack
               direction={isMobile ? "row-reverse" : "row"}
               justifyContent={isMobile ? "space-between" : "flex-end"}
               sx={styles.iconsContainer}
               spacing={1}
            >
               <IconButton onClick={onClose} sx={styles.closeIcon}>
                  <BasicShareIcon />
               </IconButton>
               <IconButton onClick={onClose} sx={styles.closeIcon}>
                  <Box component={isMobile ? ChevronLeft : X} />
               </IconButton>
            </Stack>
         </Box>

         <Stack sx={styles.content}>
            <Typography variant="brandedH4" fontWeight={600}>
               {title}
            </Typography>

            <Stack sx={styles.detailsContainer}>
               <Box sx={styles.detailCol}>
                  <Box component={Calendar} sx={styles.icon} />
                  <Stack>
                     <Typography variant="medium" color="neutral.800">
                        {DateUtil.getPrettyDateWithoutHourDayjs(
                           startAt?.toDate()
                        )}
                     </Typography>
                     <Typography variant="small" sx={styles.text}>
                        {startAt
                           ? `At ${DateUtil.eventPreviewHour(startAt.toDate())}`
                           : null}
                     </Typography>
                  </Stack>
               </Box>
               <Box sx={styles.detailCol}>
                  <Box component={MapPin} sx={styles.icon} />
                  <Box>
                     <Typography variant="medium" color="neutral.800">
                        {address?.cityISOCode?.name},{" "}
                        {address?.countryISOCode?.name}
                     </Typography>
                     <br />
                     <Typography variant="small" color="neutral.600">
                        {address?.street} {address?.cityISOCode?.name},{" "}
                        {address?.countryISOCode?.name}
                     </Typography>
                  </Box>
               </Box>
            </Stack>

            <Box
               sx={styles.organisedContainer}
               component={companyUrl ? Link : Box}
               href={companyUrl}
            >
               <Typography variant="medium" sx={styles.headerText}>
                  Organised by
               </Typography>
               <Box sx={styles.organisedRow}>
                  {company?.logoUrl ? (
                     <CircularLogo
                        src={company?.logoUrl || ""}
                        alt={`${company?.name} logo`}
                        size={40}
                     />
                  ) : null}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                     <Typography variant="medium" color="neutral.800">
                        {company?.name}
                     </Typography>
                     <br />
                     {industries?.[0]?.name ? (
                        <Typography variant="small" sx={styles.text}>
                           {industries?.[0]?.name}
                        </Typography>
                     ) : null}
                  </Box>
                  <Box
                     component={ChevronRight}
                     sx={{ color: "neutral.700", width: 24, height: 24 }}
                  />
               </Box>
            </Box>

            <Box sx={styles.aboutContainer}>
               <Typography variant="medium" sx={styles.headerText}>
                  About this event
               </Typography>
               <SanitizedHTML color="neutral.700" htmlString={description} />
            </Box>

            <Box sx={styles.stickyCta}>
               {registrationUrl ? (
                  <Button
                     variant="contained"
                     color="primary"
                     size="large"
                     href={registrationUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     Register to event
                  </Button>
               ) : null}
            </Box>
         </Stack>
      </Box>
   )
}
