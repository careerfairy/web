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
import { EmblaOptionsType } from "embla-carousel-react"

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
})

const EventSection = () => {
   const {
      group,
      upcomingLivestreams,
      pastLivestreams,
      sectionRefs: { eventSectionRef },
   } = useCompanyPage()
   const eventsCarouselEmblaOptions = useMemo<EmblaOptionsType>(
      () => ({
         axis: "x",
         loop: false,
         align: "center",
         dragThreshold: 0.5,
         dragFree: true,
         inViewThreshold: 0,
      }),
      []
   )
   const query = `companyId=${group.id}`
   const isMounted = useMountedState()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()
   const [eventToEdit, setEventToEdit] = useState(null)

   return isMounted() ? (
      <Box sx={styles.root}>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         <Stack spacing={8}>
            <EventsPreviewCarousel
               options={eventsCarouselEmblaOptions}
               title="Next Live Streams"
               events={upcomingLivestreams ?? []}
               type={EventsTypes.comingUp}
               seeMoreLink={`/next-livestreams?${query}`}
               loading={false}
            />

            {Boolean(pastLivestreams?.length) ? (
               <EventsPreviewCarousel
                  options={eventsCarouselEmblaOptions}
                  title="Past Live Streams"
                  events={pastLivestreams ?? []}
                  type={EventsTypes.pastEvents}
                  seeMoreLink={`/past-livestreams?${query}`}
                  loading={false}
               />
            ) : (
               <></>
            )}
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
