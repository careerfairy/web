import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Box } from "@material-ui/core";
import UpcomingLivestreamCard from "../../../common/stream-cards/UpcomingLivestreamCard";
import { getMaxSlides } from "util/CommonUtil";

const useStyles = makeStyles((theme) => ({
   root: {
      marginLeft: "auto",
      marginRight: "auto",
      width: "95%",
      [theme.breakpoints.down("md")]: {
         width: "100%",
      },
   },
   dotElements: {
      "& li": {
         width: "0.5rem",
         height: "0.5rem",
         border: `1px solid ${theme.palette.primary.main}`,
         borderRadius: "100%",
      },
      "& .slick-active": {
         background: theme.palette.primary.main,
      },
   },
}));

const UpcomingLivestreamsCarousel = ({
   upcomingStreams,
   handleOpenJoinModal,
   additionalSettings,
   allowRegister,
}) => {
   const classes = useStyles();

   const settings = {
      infinite: true,
      speed: 500,
      lazyLoad: true,
      arrows: false,
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
            <ul
               className={classes.dotElements}
               style={{ margin: "0px", padding: 0 }}
            >
               {dots}
            </ul>
         </div>
      ),
      slidesToShow: getMaxSlides(4, upcomingStreams.length),
      slidesToScroll: getMaxSlides(4, upcomingStreams.length),
      initialSlide: 0,
      responsive: [
         {
            breakpoint: 1400,
            settings: {
               slidesToShow: getMaxSlides(3, upcomingStreams.length),
               slidesToScroll: getMaxSlides(3, upcomingStreams.length),
               infinite: true,
            },
         },
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: getMaxSlides(2, upcomingStreams.length),
               slidesToScroll: getMaxSlides(2, upcomingStreams.length),
               dots: true,
               infinite: true,
            },
         },
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
               dots: true,
               slidesToScroll: 1,
            },
         },
      ],
      ...additionalSettings,
   };

   return (
      <div className={classes.root}>
         <Slider {...settings}>
            {upcomingStreams.map((livestream) => (
               <Box key={livestream.id} p={2}>
                  <UpcomingLivestreamCard
                     handleOpenJoinModal={handleOpenJoinModal}
                     livestream={livestream}
                     allowRegister={allowRegister}
                  />
               </Box>
            ))}
         </Slider>
      </div>
   );
};

export default UpcomingLivestreamsCarousel;
