import { Box, Link, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC, useCallback, useState } from "react"
import { useMountedState } from "react-use"
import { SectionAnchor, TabValue, useCompanyPage } from "../"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import StayUpToDateBanner from "./StayUpToDateBanner"

const styles = sxStyles({
   root: {
      position: "relative",
      minHeight: (theme) => theme.spacing(50),
   },
   eventsWrapper: {
      mt: 2,
      mb: 2,
   },
   // titleSection: {
   //    display: "flex",
   //    justifyContent: "space-between",
   //    alignItems: "center",
   // },
   // addEvent: {
   //    borderRadius: "10px",
   //    height: (theme) => theme.spacing(40),
   //    width: (theme) => theme.spacing(35),
   //    border: "dashed",
   //    borderColor: (theme) => theme.palette.grey.A400,
   //    fontSize: "16px",

   //    "&:hover": {
   //       border: "dashed",
   //    },
   // },
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
   // description: {
   //    display: "flex",
   //    justifyContent: "space-between",
   //    alignItems: "center",
   //    paddingTop: 2,
   // },
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

   const eventsCarouselStyling: EventsCarouselStyling = {
      compact: isMobile,
      seeMoreSx: styles.seeMoreText,
      showArrows: isMobile,
      headerAsLink: isMobile,
      title: styles.eventTitle,
      eventsHeader: styles.eventsHeader,
      padding: false,
   }

   return isMounted() ? (
      <Box sx={styles.root}>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         <Stack spacing={"8px"} sx={isMobile ? styles.eventsWrapper : null}>
            <ConditionalWrapper
               condition={Boolean(upcomingLivestreams?.length)}
               fallback={
                  <StayUpToDateComponent
                     title="Next Live Streams"
                     seeMoreLink={`/next-livestreams?${query}`}
                     titleAsLink={isMobile}
                  />
               }
            >
               <EventsPreviewCarousel
                  title={
                     <Typography
                        variant="brandedH3"
                        fontWeight={"600"}
                        color="neutral.900"
                     >
                        Next Live Streams
                     </Typography>
                  }
                  events={upcomingLivestreams ?? []}
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
                  title={
                     <Typography variant="h4" fontWeight={"600"} color="black">
                        Past Live Streams
                     </Typography>
                  }
                  events={pastLivestreams ?? []}
                  type={EventsTypes.PAST_EVENTS}
                  seeMoreLink={`/past-livestreams?${query}`}
                  styling={eventsCarouselStyling}
                  preventPaddingSlide
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
   description?: string
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
         <StayUpToDateBanner />
      </Box>
   )
}
export const MAX_UPCOMING_STREAMS = 10
export const MAX_PAST_STREAMS = 5

export default EventSection
