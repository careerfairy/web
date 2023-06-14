import React, { MutableRefObject } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { useTheme } from "@mui/styles"
import { useMediaQuery } from "@mui/material"

type Props = {
   sliderRef: MutableRefObject<any>
   children: React.ReactNode
}

const styles = sxStyles({
   carousel: {
      "& .slick-track": {
         display: "flex",
      },
      "& .slick-slide": {
         height: "inherit",
         "& > *": {
            height: "100%",
            display: "flex",
         },
      },
   },
   notCentered: {
      "& .slick-track": {
         mx: 0,
      },
   },
})

const EventCarousel = ({ sliderRef, children }: Props) => {
   const theme = useTheme()
   const isMobile = useMediaQuery(theme.breakpoints.down("lg")) // need to use this instead of useIsMobile() because of nested gid layout of company page

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
