import { Box, Stack } from "@mui/material"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import { useMemo, useState } from "react"
import { useMountedState } from "react-use"
import { SectionAnchor, TabValue, useCompanyPage } from "../"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"
import EventsPreviewCarousel, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import useIsMobile from "components/custom-hook/useIsMobile"

import StayUpToDateBanner from "./StayUpToDateBanner"
import ConditionalWrapper from "components/util/ConditionalWrapper"

const slideSpacing = 21
const desktopSlideWidth = 322 + slideSpacing
const mobileSlideWidth = 289 + slideSpacing
const styles = sxStyles({
   root: {
      position: "relative",
      minHeight: (theme) => theme.spacing(50),
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
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      position: "relative",
      height: {
         xs: 355,
         md: 355,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
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
      pr: 2,
      pb: 0.5,
   },
   seeMoreText: {
      color: "text.secondary",
      textDecoration: "underline",
      pr: 1,
      pb: 10,
   },
   viewportSx: {
      overflow: "hidden",
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

   const [isDialogOpen, handleCloseDialog] = useDialogStateHandler()
   const [eventToEdit, setEventToEdit] = useState(null)
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

   const stayUpToDateBanner = (title: String) => {
      return (
         <>
            <StayUpToDateBanner />
         </>
      )
   }
   return isMounted() ? (
      <Box sx={styles.root}>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         <Stack spacing={4}>
            <EventsPreviewCarousel
               title="Next Live Streams"
               events={upcomingLivestreams ?? []}
               eventDescription={upcomingEventsDescription}
               type={EventsTypes.comingUp}
               seeMoreLink={`/next-livestreams?${query}`}
               styling={{
                  compact: isMobile,
                  seeMoreSx: styles.seeMoreText,
                  viewportSx: styles.viewportSx,
                  showArrows: isMobile,
                  headerAsLink: isMobile,
                  slide: styles.slide,
                  title: styles.eventTitle,
                  titleVariant: "h4",
                  eventsHeader: styles.eventsHeader,
               }}
            >
               {stayUpToDateBanner("Next Live Streams")}
            </EventsPreviewCarousel>
            <ConditionalWrapper condition={Boolean(pastLivestreams?.length)}>
               <EventsPreviewCarousel
                  title="Past Live Streams"
                  events={pastLivestreams ?? []}
                  eventDescription={pastEventsDescription}
                  type={EventsTypes.pastEvents}
                  seeMoreLink={`/past-livestreams?${query}`}
                  styling={{
                     compact: isMobile,
                     seeMoreSx: {
                        textDecoration: "underline",
                        color: "#2ABAA5",
                     },
                     viewportSx: styles.viewportSx,
                     showArrows: isMobile,
                     headerAsLink: isMobile,
                     slide: styles.slide,
                     title: styles.eventTitle,
                     titleVariant: "h4",
                     eventsHeader: styles.eventsHeader,
                  }}
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
                  handleResetCurrentStream={() => {}}
                  currentStream={eventToEdit}
                  onClose={handleCloseDialog}
               />
            </StreamCreationProvider>
         ) : null}
      </Box>
   ) : null
}

export const MAX_UPCOMING_STREAMS = 10
export const MAX_PAST_STREAMS = 5

export default EventSection
