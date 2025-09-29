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
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import SanitizedHTML from "components/util/SanitizedHTML"
import SEO from "components/util/SEO"
import { BasicShareIcon } from "components/views/common/icons/BasicShareIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "components/views/common/transitions"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import { offlineEventService } from "data/firebase/OfflineEventService"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from "react-feather"
import useSWR from "swr"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { getOfflineEventMetaInfo } from "util/SeoUtil"

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

export const OFFLINE_EVENT_DIALOG_KEY = "offline-event"

export const OfflineEventDialog = ({ eventFromServer }: Props) => {
   const { push, query, pathname } = useRouter()
   const isMobile = useIsMobile()
   const isMounted = useIsMounted()

   const { data: event } = useSWR(
      query[OFFLINE_EVENT_DIALOG_KEY]
         ? ["event", query[OFFLINE_EVENT_DIALOG_KEY]]
         : null,
      () =>
         offlineEventService.getById(query[OFFLINE_EVENT_DIALOG_KEY] as string),
      {
         fallbackData:
            eventFromServer?.id === query[OFFLINE_EVENT_DIALOG_KEY]
               ? eventFromServer
               : null,
      }
   )

   const handleClose = useCallback(() => {
      const newQuery = {
         ...query,
      }

      delete newQuery[OFFLINE_EVENT_DIALOG_KEY]

      push(
         {
            pathname,
            query: newQuery,
         },
         undefined,
         {
            shallow: true,
         }
      )
   }, [push, query, pathname])

   const handleShare = useCallback(() => {
      alert(`Share ${event?.title}`)
   }, [event])

   return (
      <>
         {event ? <SEO {...getOfflineEventMetaInfo(event)} /> : null}
         <Dialog
            open={Boolean(event)}
            onClose={handleClose}
            disablePortal
            TransitionComponent={
               isMobile ? SlideLeftTransition : SlideUpTransition
            }
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
               sx: styles.dialogPaper,
            }}
            sx={{
               ...NICE_SCROLLBAR_STYLES,
            }}
            TransitionProps={{
               unmountOnExit: true,
               // WHat this does is skips the slide up animation when loading the page for the first time, so it appears like the dialog is already open for ssr
               appear: isMounted,
            }}
         >
            <Content
               event={event}
               onClose={handleClose}
               onShare={handleShare}
            />
         </Dialog>
      </>
   )
}

const Content = ({
   event,
   onClose,
   onShare,
}: {
   event: OfflineEvent
   onClose: () => void
   onShare: () => void
}) => {
   const isMobile = useIsMobile()

   const companyUrl = event?.group?.publicProfile
      ? makeGroupCompanyPageUrl(event?.group?.universityName, {
           interactionSource: InteractionSources.Offline_Event_Dialog,
        })
      : undefined

   const {
      backgroundImageUrl,
      title,
      startAt,
      description,
      registrationUrl,
      address,
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
               <IconButton onClick={onShare} sx={styles.closeIcon}>
                  <Box component={isMobile ? ChevronLeft : X} />
               </IconButton>
            </Stack>
         </Box>

         <Stack sx={styles.content}>
            <Typography variant="desktopBrandedH4" fontWeight={600} px={1}>
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
                        {address?.city}, {address?.country}
                     </Typography>
                     <br />
                     <Typography variant="small" color="neutral.600">
                        {address?.street} {address?.city}, {address?.country}
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
                  {event?.group?.logoUrl ? (
                     <CircularLogo
                        src={event?.group?.logoUrl || ""}
                        alt={`${event?.group?.universityName} logo`}
                        size={40}
                     />
                  ) : null}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                     <Typography variant="medium" color="neutral.800">
                        {event?.group?.universityName}
                     </Typography>
                     <br />
                     {event?.group?.companyIndustries?.length ? (
                        <Typography variant="small" sx={styles.text}>
                           {event?.group?.companyIndustries
                              ?.map((industry) => industry.name)
                              .join(", ")}
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
            </Box>
         </Stack>
      </Box>
   )
}
