import { Box, Button, Grid, IconButton, Typography } from "@mui/material"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"
import { useCompanyPage } from "../index"
import React, { useCallback, useRef, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import { useTheme } from "@mui/material/styles"
import { Add } from "@mui/icons-material"
import Link from "next/link"
import EventCarousel from "./EventCarousel"
import { ArrowLeft, ArrowRight } from "react-feather"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import EventCard from "./EventCard"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import RegistrationModal from "../../common/registration-modal"
import useIsMobile from "../../../custom-hook/useIsMobile"

const styles = sxStyles({
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
   const { group, upcomingLivestreams, editMode } = useCompanyPage()
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal()
   const isMobile = useIsMobile()

   const [openDialog, setOpenDialog] = useState(false)
   const [eventToEdit, setEventToEdit] = useState(null)
   const { spacing } = useTheme()
   const sliderRef = useRef(null)

   const handleNext = useCallback(() => {
      sliderRef.current?.slickNext()
   }, [])

   const handlePrev = useCallback(() => {
      sliderRef.current?.slickPrev()
   }, [])

   const handleCloseDialog = useCallback(() => {
      setOpenDialog(false)
   }, [])

   const handleOpenEvent = useCallback((event: LivestreamEvent) => {
      setEventToEdit(event)
      setOpenDialog(true)
   }, [])

   if (!editMode && !upcomingLivestreams?.length) {
      return null
   }

   return (
      <Box minHeight={{ md: spacing(50) }}>
         <Box sx={styles.titleSection}>
            <Typography variant="h4" fontWeight={"600"} color="black">
               Next Live Stream
            </Typography>
            {upcomingLivestreams?.length > 2 ? (
               <Box>
                  <IconButton
                     color="inherit"
                     sx={styles.arrowIcon}
                     onClick={handlePrev}
                  >
                     <ArrowLeft fontSize={"large"} />
                  </IconButton>
                  <IconButton
                     color="inherit"
                     sx={styles.arrowIcon}
                     onClick={handleNext}
                  >
                     <ArrowRight fontSize={"large"} />
                  </IconButton>
               </Box>
            ) : null}
         </Box>
         <Box mt={2}>
            {upcomingLivestreams?.length > 0 ? (
               <Box>
                  {isMobile ? null : (
                     <Typography
                        variant="h6"
                        fontWeight={"400"}
                        color="textSecondary"
                     >
                        {editMode
                           ? "Below are your published live streams, these will be shown on your company page."
                           : "Watch live streams. Discover new career ideas, interesting jobs, internships and programmes for students. Get hired."}
                     </Typography>
                  )}
                  <Grid item xs={12}>
                     <EventCarousel sliderRef={sliderRef}>
                        {upcomingLivestreams.map((event) => (
                           <EventCard
                              key={event.id}
                              event={event}
                              handleEditEvent={handleOpenEvent}
                              handleRegister={handleClickRegister}
                           />
                        ))}
                     </EventCarousel>
                  </Grid>
               </Box>
            ) : editMode ? (
               <Link href={`/group/${group.id}/admin/events`}>
                  <a>
                     <Button color="secondary" sx={styles.addEvent}>
                        <Box>
                           <Add sx={{ height: "58px", width: "58px" }} />
                           <Typography variant="subtitle2" color={"black"}>
                              Create new live stream
                           </Typography>
                        </Box>
                     </Button>
                  </a>
               </Link>
            ) : null}
         </Box>

         <StreamCreationProvider>
            <NewStreamModal
               group={group}
               typeOfStream={"upcoming"}
               open={openDialog}
               handlePublishStream={null}
               handleResetCurrentStream={() => {}}
               currentStream={eventToEdit}
               onClose={handleCloseDialog}
            />
         </StreamCreationProvider>

         <RegistrationModal
            open={Boolean(joinGroupModalData)}
            onFinish={handleCloseJoinModal}
            promptOtherEventsOnFinal={!group?.id}
            livestream={joinGroupModalData?.livestream}
            groups={joinGroupModalData?.groups}
            targetGroupId={joinGroupModalData?.targetGroupId}
            handleClose={handleCloseJoinModal}
         />
      </Box>
   )
}

export default EventSection
