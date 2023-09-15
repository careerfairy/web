import React, { FC, useCallback } from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import EventPreviewCard from "../../../common/stream-cards/EventPreviewCard"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

const styles = sxStyles({
   content: {
      textAlign: "center",
      p: 4,
      pt: 6,
   },
   eventCard: {
      mt: 8,
      mb: 16,
   },
})

type Props = {
   event: LivestreamEvent
}
const SparkEventFullCardNotification: FC<Props> = ({ event }) => {
   const groupName = "Jane Street"

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
               {groupName}
            </Typography>
            <Typography variant={"h5"} mt={3}>
               But you still have time to register to their upcoming live
               stream!
            </Typography>
         </Box>

         <Box sx={styles.eventCard}>
            <EventPreviewCard event={event} disableClick={true} />
         </Box>

         <Box>
            <Button
               color="primary"
               variant="contained"
               onClick={handleRegister}
            >
               Register to live stream
            </Button>
         </Box>
      </Box>
   )
}

export default SparkEventFullCardNotification
