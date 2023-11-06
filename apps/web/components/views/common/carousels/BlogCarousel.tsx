import React, { useState } from "react"
import { Carousel } from "types/cmsTypes"
import Box from "@mui/material/Box"
import Slider from "react-slick"
import { GraphCMSImageLoader } from "../../../cms/util"
import Image from "next/legacy/image"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { SampleNextArrow, SamplePrevArrow } from "./arrows"
import Lightbox from "react-image-lightbox"
import "react-image-lightbox/style.css" // This only needs to be imported once in your app

import { EmbedProps } from "@graphcms/rich-text-types"
import { useTheme } from "@mui/material/styles"

const styles = {
   root: {
      "& .slick-slider": {
         display: "grid",
         pb: 4,
         my: 2,
      },
      "& .slick-prev": {
         left: 0,
      },
      "& .slick-next": {
         right: 0,
      },
      "& .slick-track": {
         display: "flex",
         alignItems: "center",
      },
      "& .slick-dots": (theme) => ({
         bottom: 0,
         "& li.slick-active button::before": {
            color: theme.palette.primary.main,
         },
         "& li": {
            "& button::before": {
               fontSize: theme.typography.pxToRem(11),
               opacity: 0.3,
            },
         },
      }),
   },
   imageWrapper: {
      px: 2,
      display: "flex !important",
      justifyContent: "center",
      alignItems: "center",
      "& img": {
         borderRadius: 3,
         cursor: "pointer",
      },
   },
}

const BlogCarousel = ({ images, nodeId }: EmbedProps<Carousel>) => {
   const [photoIndex, setPhotoIndex] = useState(0)
   const theme = useTheme()
   const [isOpenLightbox, setIsOpenLightbox] = useState(false)
   const [settings] = useState({
      dots: true,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      lazyLoad: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 5000,
      slidesToShow: 3,
      slidesToScroll: 1,
      initialSlide: 0,
      centerMode: true,
      arrows: true,
      responsive: [
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
            },
         },
      ],
   })

   const handleOpenLightbox = (index: number) => {
      if (!isNaN(index)) {
         setPhotoIndex(index)
      }
      setIsOpenLightbox(true)
   }

   if (images?.length < 2) return null

   return (
      <>
         <Box sx={styles.root}>
            <Slider {...settings}>
               {images.map(({ url, height, width, alt }, index) => (
                  <Box key={url} sx={styles.imageWrapper}>
                     <Image
                        onClick={() => handleOpenLightbox(index)}
                        alt={alt || "image"}
                        height={height}
                        width={width}
                        loader={GraphCMSImageLoader}
                        src={url}
                     />
                  </Box>
               ))}
            </Slider>
         </Box>
         {isOpenLightbox && (
            // @ts-ignore
            <Lightbox
               mainSrc={images[photoIndex].url}
               reactModalStyle={{
                  overlay: { zIndex: theme.zIndex.drawer + 1 },
               }}
               imageCaption={images[photoIndex].caption}
               nextSrc={images[(photoIndex + 1) % images.length]}
               prevSrc={
                  images[(photoIndex + images.length - 1) % images.length]
               }
               onCloseRequest={() => setIsOpenLightbox(false)}
               onMovePrevRequest={() =>
                  setPhotoIndex(
                     (photoIndex + images.length - 1) % images.length
                  )
               }
               onMoveNextRequest={() =>
                  setPhotoIndex((photoIndex + 1) % images.length)
               }
            />
         )}
      </>
   )
}

export default BlogCarousel
