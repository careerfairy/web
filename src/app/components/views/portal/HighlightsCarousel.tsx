import React, { useEffect, useMemo, useState } from "react";
import HighlightItem from "./HighlightItem";
import HighlightVideoDialog from "./HighlightVideoDialog";
import { useWindowSize } from "react-use";
import { dummyHighlights } from "./dummyData";
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
const arrowFontSize = 30;
const styles = {
   carousel: {
      "& .slick-track": {
         ml: 0,
         mr: 0,
      },
      "& .slick-next": {
         right: "10px",
         "&:before": {
            opacity: 1,
            fontSize: arrowFontSize,
            textShadow: (theme) => theme.darkTextShadow,
         },
      },
      "& .slick-prev": {
         left: "10px",
         zIndex: 1,
         "&:before": {
            opacity: 1,
            fontSize: arrowFontSize,
            textShadow: (theme) => theme.darkTextShadow,
         },
      },
   },
   root: {
      "& .slick-next": {
         right: "10px",
         "&:before": {
            opacity: 1,
            fontSize: arrowFontSize,
            textShadow: (theme) => theme.darkTextShadow,
         },
      },
      "& .slick-prev": {
         left: "10px",
         zIndex: 1,
         "&:before": {
            opacity: 1,
            fontSize: arrowFontSize,
            textShadow: (theme) => theme.darkTextShadow,
         },
      },
   },
};
const HighlightsCarousel = () => {
   const {
      breakpoints: { up },
   } = useTheme();

   const isExtraSmall = useMediaQuery(up("xs"));
   const isSmall = useMediaQuery(up("sm"));
   const isMedium = useMediaQuery(up("md"));
   const isLarge = useMediaQuery(up("lg"));

   const numSlides: number = useMemo(() => {
      return isLarge ? 5 : isMedium ? 4 : isSmall ? 3 : 1;
   }, [isExtraSmall, isSmall, isMedium, isLarge]);

   const { shouldShowHighlightsCarousel } = useFirebaseService();
   const [isTouchScreen, setIsTouchScreen] = useState(false);
   const dimensions = useWindowSize();
   const [showCarousel, setShowCarousel] = useState(false);
   useEffect(() => {
      (async function () {
         setShowCarousel(await shouldShowHighlightsCarousel());
      })();
   }, []);

   useEffect(() => {
      const touch = matchMedia("(hover: none)").matches;
      setIsTouchScreen(touch);
   }, [dimensions]);

   const [videoUrl, setVideoUrl] = useState(null);
   const handleOpenVideoDialog = (videoUrl: string) => {
      setVideoUrl(videoUrl);
   };

   const handleCloseVideoDialog = () => {
      setVideoUrl(null);
   };
   if (!showCarousel) {
      return null;
   }

   return (
      <>
         <Box
            sx={styles.carousel}
            component={Slider}
            autoplay={false}
            lazyLoad
            infinite={false}
            arrows
            swipeToSlide
            swipe={isTouchScreen}
            slidesToShow={numSlides}
            slidesToScroll={numSlides}
            initialSlide={0}
         >
            {dummyHighlights.map((highlight, index) => (
               <Box key={index}>
                  <HighlightItem
                     handleOpenVideoDialog={handleOpenVideoDialog}
                     highLight={highlight}
                  />
               </Box>
            ))}
         </Box>
         <HighlightVideoDialog
            videoUrl={videoUrl}
            handleClose={handleCloseVideoDialog}
         />
      </>
   );
};

export default HighlightsCarousel;
