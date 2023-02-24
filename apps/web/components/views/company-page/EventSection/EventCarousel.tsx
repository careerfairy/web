import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import React, { MutableRefObject } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import EventCard from "./EventCard"
import useIsMobile from "../../../custom-hook/useIsMobile"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

type Props = {
   events: LivestreamEvent[]
   sliderRef: MutableRefObject<any>
   handleOpenEvent: (event: LivestreamEvent) => void
}

const styles = sxStyles({
   carousel: {
      "& .slick-slide": {
         "& > *": {
            display: "flex",
         },
      },
   },
   notCentered: {
      mt: 4,

      "& .slick-track": {
         mx: 0,
      },
   },
})

const EventCarousel = ({ events, sliderRef, handleOpenEvent }: Props) => {
   const isMobile = useIsMobile()

   const slidesToShow = isMobile ? 1 : 2

   return (
      <Grid sx={styles.notCentered} container spacing={0}>
         <Grid item xs={12}>
            <Box
               component={Slider}
               ref={sliderRef}
               initialSlide={0}
               slidesToScroll={slidesToShow}
               slidesToShow={slidesToShow}
               arrows={false}
               autoplay={false}
               centerMode={false}
               infinite={false}
               sx={styles.carousel}
            >
               {events.map((event) => (
                  <EventCard
                     key={event.id}
                     event={event}
                     handleClick={handleOpenEvent}
                  />
               ))}
            </Box>
         </Grid>
      </Grid>
   )
}

export default EventCarousel
