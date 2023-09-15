import React, { FC, useCallback } from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import EventPreviewCard from "../../../common/stream-cards/EventPreviewCard"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      p: 4,
      pt: 6,
   },
   eventCard: {
      mt: 6,
   },
   action: {
      display: "flex",
      alignItems: "end",
      justifyContent: "center",
      height: "100%",
   },
   btn: {
      border: "2px solid white",
      fontWeight: "bold",
      textTransform: "capitalize",
   },
})

type Props = {
   event: LivestreamEvent
}
const SparkEventFullCardNotification: FC<Props> = ({ event }) => {
   const handleRegister = useCallback(() => {
      // TODO: reuse redux action to open the dialog with the correct event
   }, [])

   return (
      <Box sx={styles.content}>
         <Box>
            <Typography variant={"h3"} fontWeight={"bold"}>
               That’s all from
            </Typography>
            <Typography variant={"h3"} fontWeight={"bold"}>
               {event.company}
            </Typography>
            <Typography variant={"h5"} mt={3}>
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
   )
}

export default SparkEventFullCardNotification
