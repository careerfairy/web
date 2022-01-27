import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Box } from "@mui/material";
import UpcomingLivestreamCard from "../../../common/stream-cards/UpcomingLivestreamCard";
import { getMaxSlides } from "util/CommonUtil";

const styles = {
   root: (theme) => ({
      marginLeft: "auto",
      marginRight: "auto",
      width: "95%",
      [theme.breakpoints.down("lg")]: {
         width: "100%",
      },
      "& .slick-dots li.slick-active button:before": {
         background: theme.palette.primary.main,
      },
      "& .slick-dots button:before": {
         width: "0.5rem",
         height: "0.5rem",
         border: `1px solid ${theme.palette.primary.main}`,
         borderRadius: "100%",
         content: '""',
      },
   }),
};

const UpcomingLivestreamsCarousel = ({
   upcomingStreams,
   handleOpenJoinModal,
   additionalSettings,
   disableAutoPlay,
   noRegister,
}) => {
   const settings = {
      infinite: true,
      speed: 500,
      lazyLoad: true,
      arrows: false,
      autoplay: !disableAutoPlay,
      autoplaySpeed: 10000,
      dots: true,
      pauseOnHover: true,
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
      <Box sx={styles.root}>
         <Slider {...settings}>
            {upcomingStreams.map((livestream) => (
               <Box key={livestream.id} p={2}>
                  <UpcomingLivestreamCard
                     handleOpenJoinModal={handleOpenJoinModal}
                     livestream={livestream}
                     disableExpand
                     noRegister={noRegister}
                  />
               </Box>
            ))}
         </Slider>
      </Box>
   );
};

export default UpcomingLivestreamsCarousel;
