import { sxStyles } from "../../../../types/commonTypes"
import { Box, Button, Stack, Typography } from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { placeholderBanner } from "../../../../constants/images"
import React from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DateUtil from "../../../../util/DateUtil"

const styles = sxStyles({
   wrapper: {
      minHeight: (theme) => theme.spacing(40),
      width: "100%",
      borderRadius: "12px",

      pr: 1,
   },
   backgroundImage: {
      width: "100%",
      height: "158px",
      transition: (theme) =>
         theme.transitions.create(["height", "transform"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
         }),
      objectFit: "cover",
      borderRadius: "12px 12px 0 0",
   },
   content: {
      border: "1px solid #EDE7FD",
      borderTop: "none",
      borderRadius: "0 0 12px 12px",
      p: 2,
   },
   button: {
      display: "flex",
      justifyContent: "end",
      mt: (theme) => `${theme.spacing(3)} !important`,
   },
})

type Props = {
   event: LivestreamEvent
   handleClick: (event: LivestreamEvent) => void
}

const EventCard = ({ event, handleClick }: Props) => {
   return (
      <Box sx={styles.wrapper}>
         <Box
            component="img"
            sx={styles.backgroundImage}
            src={
               getResizedUrl(event?.backgroundImageUrl, "sm") ||
               placeholderBanner
            }
            alt="thumbnail"
            loading="lazy"
         />
         <Box sx={styles.content}>
            <Stack spacing={1}>
               <Typography
                  fontWeight={400}
                  color={"text.secondary"}
                  fontSize={13}
               >
                  {DateUtil.eventPreviewDate(event?.startDate)}
               </Typography>

               <Typography fontWeight={600} fontSize={15}>
                  {event?.title}
               </Typography>

               <Box sx={styles.button}>
                  <Button
                     size="small"
                     variant="contained"
                     color="primary"
                     onClick={() => handleClick(event)}
                  >
                     MANAGE LIVE STREAM
                  </Button>
               </Box>
            </Stack>
         </Box>
      </Box>
   )
}

export default EventCard
