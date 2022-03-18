import React, { useState } from "react"
import testimonialData from "../testimonialData"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Slider from "react-slick"
import TestimonialCard from "./TestimonialCard"
import NextIcon from "@mui/icons-material/NavigateNextRounded"
import PrevIcon from "@mui/icons-material/NavigateBeforeRounded"
import { Box, Fab } from "@mui/material"

const styles = {
   arrow: (theme) => ({
      [theme.breakpoints.down("lg")]: {
         display: "none !important",
      },
      zIndex: 1,
      "&:before": {
         display: "none !important",
      },
   }),
}

function SampleNextArrow(props) {
   const { className, onClick } = props
   return (
      <Box sx={styles.arrow} className={className}>
         <Fab
            size="small"
            onClick={onClick}
            color="primary"
            aria-label="next-testimonial"
         >
            <NextIcon />
         </Fab>
      </Box>
   )
}

function SamplePrevArrow(props) {
   const { className, onClick } = props
   return (
      <Box sx={styles.arrow} className={className}>
         <Fab
            size="small"
            onClick={onClick}
            color="primary"
            aria-label="previous-testimonial"
         >
            <PrevIcon />
         </Fab>
      </Box>
   )
}

const TestimonialCarousel = ({}) => {
   const [settings] = useState({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      // lazyLoad: true,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      initialSlide: 0,
      autoplay: true,
      autoplaySpeed: 10000,
      pauseOnHover: true,
      appendDots: (dots) => (
         <div
            style={{
               borderRadius: "10px",
               padding: "10px",
            }}
         >
            <ul style={{ margin: "0px" }}> {dots} </ul>
         </div>
      ),
   })

   return (
      <div>
         <Slider {...settings}>
            {testimonialData.map(
               (
                  {
                     name,
                     reviewText,
                     title,
                     rating,
                     position,
                     avatarUrl,
                     companyUrl,
                  },
                  index
               ) => (
                  <TestimonialCard
                     key={avatarUrl}
                     {...{
                        name,
                        reviewText,
                        title,
                        rating,
                        position,
                        avatarUrl,
                        companyUrl,
                        index,
                     }}
                  />
               )
            )}
         </Slider>
      </div>
   )
}

export default TestimonialCarousel
