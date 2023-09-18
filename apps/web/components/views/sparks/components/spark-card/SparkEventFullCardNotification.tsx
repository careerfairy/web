import React, { useCallback, useRef } from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import EventPreviewCard from "../../../common/stream-cards/EventPreviewCard"
import { useDispatch, useSelector } from "react-redux"
import { cardNotificationSelector } from "../../../../../store/selectors/sparksFeedSelectors"
import useLivestream from "../../../../custom-hook/live-stream/useLivestream"
import { showEventDetailsDialog } from "../../../../../store/reducers/sparksFeedReducer"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      px: { md: 4 },

      "@media (max-height: 900px)": {
         px: { xs: 1, md: 1 },
      },
   },
   header: {
      textAlign: "center",
   },
   eventCard: {
      mt: { xs: 3, md: 6 },

      "@media (max-height: 900px)": {
         mt: 1,
      },
   },
   action: {
      display: "flex",
      alignItems: "end",
      justifyContent: "center",
      height: "100%",
   },
   btn: {
      border: "1.5px solid white",
      fontWeight: "bold",
      textTransform: "capitalize",
   },
   title: {
      fontSize: "32px !important",
      fontWeight: "bold",

      "@media (max-height: 800px)": {
         fontSize: "22px !important",
      },
   },
   subtitle: {
      fontSize: "18px !important",
      mt: { md: 2 },

      "@media (max-height: 800px)": {
         fontSize: "14px !important",
      },
   },
})

const SparkEventFullCardNotification = () => {
   const dispatch = useDispatch()
   const ref = useRef(null)
   const cardNotification = useSelector(cardNotificationSelector)
   const { data: event } = useLivestream(cardNotification.eventId)

   const handleRegister = useCallback(() => {
      dispatch(showEventDetailsDialog(true))
   }, [dispatch])

   return event ? (
      <Box sx={styles.content}>
         <Box sx={styles.header}>
            <Typography variant={"h4"} sx={styles.title}>
               That’s all from
            </Typography>
            <Typography variant={"h4"} sx={styles.title}>
               {event.company}
            </Typography>
            <Typography variant={"h6"} sx={styles.subtitle}>
               But you still have time to register to their upcoming live
               stream!
            </Typography>
         </Box>

         <Box sx={styles.eventCard} ref={ref}>
            <EventPreviewCard event={event} disableClick={true} ref={ref} />
         </Box>

         <Box sx={styles.action}>
            <Button
               color="primary"
               variant="contained"
               onClick={handleRegister}
               sx={styles.btn}
            >
               Register to live stream
            </Button>
         </Box>
      </Box>
   ) : null
}

export default SparkEventFullCardNotification
