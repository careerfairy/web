import React, { useState } from "react";
import HighlightItem, { HighLightType } from "./HighlightItem";
import BasicCarousel from "components/views/common/carousels/BasicCarousel";
import HighlightVideoDialog from "./HighlightVideoDialog";

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
const HighlightsCarousel = ({ highLights }: HighlightsCarouselProps) => {
   const [videoUrl, setVideoUrl] = useState(null);
   const handleOpenVideoDialog = (videoUrl: string) => {
      setVideoUrl(videoUrl);
   };

   const handleCloseVideoDialog = () => {
      setVideoUrl(null);
   };

   return (
      <>
         <BasicCarousel
            sx={styles.root}
            dots={false}
            slidesToShow={4}
            arrows
            slidesToScroll={4}
            initialSlide={0}
            variableWidth
            responsive={[
               {
                  breakpoint: 1024,
                  settings: {
                     slidesToShow: 3,
                     slidesToScroll: 3,
                     infinite: true,
                  },
               },
               {
                  breakpoint: 600,
                  settings: {
                     slidesToShow: 2,
                     slidesToScroll: 2,
                     initialSlide: 2,
                  },
               },
               {
                  breakpoint: 480,
                  settings: {
                     slidesToShow: 1,
                     slidesToScroll: 1,
                  },
               },
            ]}
         >
            {highLights.map((highlight, index) => (
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

interface HighlightsCarouselProps {
   highLights: HighLightType[];
}
export default HighlightsCarousel;
