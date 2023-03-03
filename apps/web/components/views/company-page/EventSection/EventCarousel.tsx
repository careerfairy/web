import React, { MutableRefObject } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import useIsMobile from "../../../custom-hook/useIsMobile"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

type Props = {
   sliderRef: MutableRefObject<any>
   children: JSX.Element[]
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

const EventCarousel = ({ sliderRef, children }: Props) => {
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
               {children}
            </Box>
         </Grid>
      </Grid>
   )
}

export default EventCarousel
