import React, { useEffect, useState } from "react";
import HighlightItem from "./HighlightItem";
import BasicCarousel from "components/views/common/carousels/BasicCarousel";
import HighlightVideoDialog from "./HighlightVideoDialog";
import { useWindowSize } from "react-use";
import { dummyHighlights } from "./dummyData";
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext";

const arrowFontSize = 30;
const styles = {
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
         <BasicCarousel
            sx={styles.root}
            dots={false}
            infinite
            arrows
            swipeToSlide
            swipe={isTouchScreen}
            slidesToScroll={4}
            initialSlide={0}
            variableWidth
         >
            {dummyHighlights.map((highlight, index) => (
               <HighlightItem
                  handleOpenVideoDialog={handleOpenVideoDialog}
                  key={index}
                  highLight={highlight}
               />
            ))}
         </BasicCarousel>
         <HighlightVideoDialog
            videoUrl={videoUrl}
            handleClose={handleCloseVideoDialog}
         />
      </>
   );
};

export default HighlightsCarousel;
