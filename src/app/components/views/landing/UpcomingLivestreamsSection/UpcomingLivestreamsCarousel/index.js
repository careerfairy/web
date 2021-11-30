import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import NextIcon from "@material-ui/icons/NavigateNextRounded";
import PrevIcon from "@material-ui/icons/NavigateBeforeRounded";
import { Box, Fab, Grow } from "@material-ui/core";
import UpcomingLivestreamCard from "../../../common/stream-cards/UpcomingLivestreamCard";

const useStyles = makeStyles((theme) => ({
   root: {
      marginLeft: "auto",
      marginRight: "auto",
      width: "95%",
      [theme.breakpoints.down("md")]: {
         width: "100%",
      },
   },
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

const UpcomingLivestreamsCarousel = ({
   upcomingStreams,
   handleOpenJoinModal,
}) => {
   const classes = useStyles();
   const [settings] = useState({
      infinite: true,
      speed: 500,
      lazyLoad: true,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      autoplay: true,
      autoplaySpeed: 10000,
      dots: true,
      pauseOnHover: true,
      appendDots: (dots) => (
         <div
            style={{
               borderRadius: "10px",
               padding: "10px",
               position: "static",
            }}
         >
            <ul style={{ margin: "0px" }}> {dots} </ul>
         </div>
      ),
      slidesToShow: 4,
      slidesToScroll: 4,
      initialSlide: 0,
      responsive: [
         {
            breakpoint: 1400,
            settings: {
               slidesToShow: 3,
               slidesToScroll: 3,
               infinite: true,
            },
         },
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: 2,
               slidesToScroll: 2,
               dots: false,
               infinite: true,
            },
         },
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
               dots: false,
               slidesToScroll: 1,
            },
         },
      ],
   });

   return (
      <div className={classes.root}>
         <Slider {...settings}>
            {upcomingStreams.map((livestream, index) => (
               <Grow
                  in
                  key={livestream.id}
                  style={{ transformOrigin: "0 0 0" }}
                  timeout={index + 1 * 600}
               >
                  <Box key={livestream.id} p={2}>
                     <UpcomingLivestreamCard
                        handleOpenJoinModal={handleOpenJoinModal}
                        livestream={livestream}
                     />
                  </Box>
               </Grow>
            ))}
         </Slider>
      </div>
   );
};

export default UpcomingLivestreamsCarousel;
