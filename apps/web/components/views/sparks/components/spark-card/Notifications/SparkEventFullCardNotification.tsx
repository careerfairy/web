import React, { FC, useCallback } from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import EventPreviewCard from "../../../../common/stream-cards/EventPreviewCard"
import { useDispatch } from "react-redux"
import useLivestream from "../../../../../custom-hook/live-stream/useLivestream"
import { showEventDetailsDialog } from "../../../../../../store/reducers/sparksFeedReducer"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      px: { md: 4 },
      py: { lg: 4 },

      "@media (max-height: 900px)": {
         px: { xs: 1, md: 1 },
         py: 0,
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
      textTransform: "none",
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

type Props = {
   eventId: string
}

const SparkEventFullCardNotification: FC<Props> = ({ eventId }) => {
   const dispatch = useDispatch()
   const { data: event } = useLivestream(eventId)

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

         <Box sx={styles.eventCard}>
            <EventPreviewCard event={event} disableClick={true} />
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
