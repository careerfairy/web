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
   const { group, upcomingLivestreams } = useCompanyPage()
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
                  <Typography
                     variant="h6"
                     fontWeight={"400"}
                     color="textSecondary"
                  >
                     Below are your published live streams, these will be shown
                     on your company page.
                  </Typography>
                  <Grid item xs={12}>
                     <EventCarousel
                        sliderRef={sliderRef}
                        handleOpenEvent={handleOpenEvent}
                     />
                  </Grid>
               </Box>
            ) : (
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
            )}
         </Box>

         <StreamCreationProvider>
            <NewStreamModal
               group={group}
               typeOfStream={"upcoming"}
               open={openDialog}
               handlePublishStream={null}
               handleResetCurrentStream={null}
               currentStream={eventToEdit}
               onClose={handleCloseDialog}
            />
         </StreamCreationProvider>
      </Box>
   )
}

export default EventSection
