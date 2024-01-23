import { Box, Link, Stack, Typography } from "@mui/material"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import { FC, useCallback, useMemo, useState } from "react"
import { useMountedState } from "react-use"
import { SectionAnchor, TabValue, useCompanyPage } from "../"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import useIsMobile from "components/custom-hook/useIsMobile"

import StayUpToDateBanner from "./StayUpToDateBanner"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

const slideSpacing = 21
const styles = sxStyles({
   root: {
      position: "relative",
      minHeight: (theme) => theme.spacing(50),
   },
   eventsWrapper: {
      mt: 2,
      mb: 2,
   },
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   addEvent: {
      borderRadius: "10px",
      height: (theme) => theme.spacing(40),
      width: (theme) => theme.spacing(35),
      border: "dashed",
      borderColor: (theme) => theme.palette.grey.A400,
      fontSize: "16px",

      "&:hover": {
         border: "dashed",
      },
   },
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   slide: {
      flex: {
         xs: `0 0 80%`,
         sm: `0 0 45%`,
         md: `0 0 65%`,
         lg: `0 0 47%`,
      },
      position: "relative",
      height: {
         xs: 355,
         md: 355,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
      },
      "&:first-of-type": {
         ml: 0.3,
      },
   },

   eventTitle: {
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontWeight: "600",
      color: "black",
      lineHeight: "27px",
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 0,
      pb: 2,
   },
   seeMoreText: {
      textDecoration: "underline",
      color: "#2ABAA5",
   },
   viewportSx: {
      overflow: "hidden",
   },
   description: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 2,
   },
   titleLink: {
      color: "#000",
      "&:hover": {
         color: "#000",
      },
   },
   underlined: {
      textDecoration: "underline",
   },
   stayUpWrapper: {
      pb: 1,
   },
})

const EventSection = () => {
   const {
      group,
      upcomingLivestreams,
      pastLivestreams,
      sectionRefs: { eventSectionRef },
      editMode,
   } = useCompanyPage()
   const query = `companyId=${group.id}`
   const isMounted = useMountedState()
   const isMobile = useIsMobile()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const [eventToEdit, setEventToEdit] = useState(null)
   const handleOpenEvent = useCallback(
      (event: LivestreamEvent) => {
         setEventToEdit(event)
         handleOpenDialog()
      },
      [handleOpenDialog]
   )

   const upcomingEventsDescription = useMemo(() => {
      if (editMode) {
         return "Below are your published live streams, these will be shown on your company page."
      }
      return "Watch live streams. Discover new career ideas, interesting jobs, internships and programmes for students. Get hired."
   }, [editMode])
   const pastEventsDescription = useMemo(() => {
      if (editMode) {
         return "Here are the recordings of your previous live streams, which will be featured on your company page."
      }
      return `Have you missed a live stream from ${group.universityName}? Don't worry, you can re-watch them all here.`
   }, [editMode, group.universityName])

   const eventsCarouselStyling: EventsCarouselStyling = {
      compact: isMobile,
      seeMoreSx: styles.seeMoreText,
      viewportSx: styles.viewportSx,
      showArrows: isMobile,
      headerAsLink: isMobile,
      slide: styles.slide,
      title: styles.eventTitle,
      titleVariant: "h4",
      eventsHeader: styles.eventsHeader,
   }

   return isMounted() ? (
      <Box sx={styles.root}>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         <Stack spacing={4} sx={isMobile ? styles.eventsWrapper : null}>
            <ConditionalWrapper
               condition={Boolean(upcomingLivestreams?.length)}
               fallback={
                  <StayUpToDateComponent
                     title="Next Live Streams"
                     description={upcomingEventsDescription}
                     seeMoreLink={`/next-livestreams?${query}`}
                     titleAsLink={isMobile}
                  />
               }
            >
               <EventsPreviewCarousel
                  title="Next Live Streams"
                  events={upcomingLivestreams ?? []}
                  eventDescription={upcomingEventsDescription}
                  type={EventsTypes.COMING_UP}
                  seeMoreLink={`/next-livestreams?${query}`}
                  styling={eventsCarouselStyling}
                  hideChipLabels={editMode}
                  showManageButton={editMode}
                  handleOpenEvent={handleOpenEvent}
               />
            </ConditionalWrapper>
            <ConditionalWrapper condition={Boolean(pastLivestreams?.length)}>
               <EventsPreviewCarousel
                  title="Past Live Streams"
                  events={pastLivestreams ?? []}
                  eventDescription={pastEventsDescription}
                  type={EventsTypes.PAST_EVENTS}
                  seeMoreLink={`/past-livestreams?${query}`}
                  styling={eventsCarouselStyling}
               />
            </ConditionalWrapper>
         </Stack>
         {isDialogOpen ? (
            <StreamCreationProvider>
               <NewStreamModal
                  group={group}
                  typeOfStream={"upcoming"}
                  open={isDialogOpen}
                  handlePublishStream={null}
                  handleResetCurrentStream={() => {
                     /* default mpty function with comment to prevent linting */
                  }}
                  currentStream={eventToEdit}
                  onClose={handleCloseDialog}
               />
            </StreamCreationProvider>
         ) : null}
      </Box>
   ) : null
}
type StayUpToDateProps = {
   title: string
   description: string
   titleAsLink?: boolean
   seeMoreLink?: string
}
/**
 *
 * @param props Component properties, name title, description, isMobile and titleAsLink
 * @returns  <StayUpToDateBanner> wrapped with Title and description and link for mobile
 */
export const StayUpToDateComponent: FC<StayUpToDateProps> = ({
   title,
   description,
   titleAsLink,
   seeMoreLink,
}) => {
   const showTitleAsLink = titleAsLink && seeMoreLink?.length > 0

   const titleComponent = (
      <Typography
         variant={"h4"}
         sx={[styles.eventTitle, showTitleAsLink ? styles.underlined : null]}
         fontWeight={"600"}
         color="black"
      >
         {title}
      </Typography>
   )
   return (
      <Box sx={styles.stayUpWrapper}>
         <Box sx={styles.eventsHeader}>
            {showTitleAsLink ? (
               <Link href={seeMoreLink} style={styles.titleLink}>
                  {titleComponent}
               </Link>
            ) : (
               titleComponent
            )}
         </Box>

         {(!showTitleAsLink && (
            <Stack mb={2}>
               <Box sx={styles.description}>
                  <Typography
                     variant="h6"
                     fontWeight={"400"}
                     color="textSecondary"
                  >
                     {description}
                  </Typography>
               </Box>
            </Stack>
         )) ||
            null}
         <StayUpToDateBanner />
      </Box>
   )
}
export const MAX_UPCOMING_STREAMS = 10
export const MAX_PAST_STREAMS = 5

export default EventSection
