import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack } from "@mui/material"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import { useCallback, useState } from "react"
import { useMountedState } from "react-use"
import { SectionAnchor, TabValue, useCompanyPage } from "../"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import useIsMobile from "../../../custom-hook/useIsMobile"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import RegistrationModal from "../../common/registration-modal"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"
import StreamCarousel from "./StreamCarousel"

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
   const isMounted = useMountedState()

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

   const upcomingHasMore = upcomingLivestreams?.length > MAX_UPCOMING_STREAMS
   const pastHasMore = pastLivestreams?.length > MAX_PAST_STREAMS

   return isMounted() ? (
      <Box sx={styles.root}>
         <SectionAnchor
            ref={eventSectionRef}
            tabValue={TabValue.livesStreams}
         />
         <Stack spacing={8}>
            <StreamCarousel
               livestreams={upcomingLivestreams ?? []}
               type="upcoming"
               title="Next Live Streams"
               handleOpenEvent={handleOpenEvent}
               hasMore={upcomingHasMore}
            />

            {Boolean(pastLivestreams?.length) && (
               <StreamCarousel
                  livestreams={pastLivestreams ?? []}
                  type="past"
                  title="Past Live Streams"
                  handleOpenEvent={handleOpenEvent}
                  hasMore={pastHasMore}
               />
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
