import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import testimonialData from "../testimonialData";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import TestimonialCard from "./TestimonialCard";
import NextIcon from "@material-ui/icons/NavigateNextRounded";
import PrevIcon from "@material-ui/icons/NavigateBeforeRounded";
import { Fab } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {},
   arrow: {
      [theme.breakpoints.down("md")]: {
         display: ["none", "!important"],
      },
      zIndex: 1,
      "&:before": {
         display: ["none", "!important"],
      },
   },
}));

function SampleNextArrow(props) {
   const { className, onClick } = props;
   const classes = useStyles();
   return (
      <div className={`${classes.arrow} ${className}`}>
         <Fab
            size="small"
            onClick={onClick}
            color="primary"
            aria-label="next-testimonial"
         >
            <NextIcon />
         </Fab>
      </div>
   );
}

function SamplePrevArrow(props) {
   const { className, onClick } = props;
   const classes = useStyles();
   return (
      <div className={`${classes.arrow} ${className}`}>
         <Fab
            size="small"
            onClick={onClick}
            color="primary"
            aria-label="previous-testimonial"
         >
            <PrevIcon />
         </Fab>
      </div>
   );
}

const TestimonialCarousel = ({}) => {
   const classes = useStyles();
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
      appendDots: dots => (
        <div
          style={{
             borderRadius: "10px",
             padding: "10px"
          }}
        >
           <ul style={{ margin: "0px" }}> {dots} </ul>
        </div>
      ),
   });

   return (
      <div className={classes.root}>
         <Slider {...settings}>
            {testimonialData.map(
               ({ name, reviewText, title, rating, position, avatarUrl, companyUrl }, index) => (
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
                        index
                     }}
                  />
               )
            )}
         </Slider>
      </div>
   );
};

export default TestimonialCarousel;
