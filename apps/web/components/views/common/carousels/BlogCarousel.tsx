import React, { useState } from "react"
import { CmsImage } from "types/cmsTypes"
import Box from "@mui/material/Box"
import Slider from "react-slick"
import { GraphCMSImageLoader } from "../../../cms/util"
import Image from "next/image"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { SampleNextArrow, SamplePrevArrow } from "./arrows"

interface Props {
   images: CmsImage[]
}

const styles = {
   root: {
      "& .slick-slider": {
         display: "grid",
         pb: 4,
         my: 2,
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
}

const BlogCarousel = ({ images }: Props) => {
   const [settings] = useState({
      dots: true,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      lazyLoad: true,
      infinite: true,
      autoplay: true,
      speed: 1000,
      slidesToShow: 3,
      slidesToScroll: 1,
      initialSlide: 0,
      centerMode: true,
      arrows: true,
      responsive: [
         {
            breakpoint: 1400,
            settings: {
               slidesToShow: 3,
            },
         },
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
            },
         },
      ],
   })

   return (
      <Box sx={styles.root}>
         <Slider {...settings}>
            {images.map(({ url, height, width, alt }) => (
               <Box
                  sx={{
                     px: 2,
                     display: "flex !important",
                     justifyContent: "center",
                     alignItems: "center",
                     "& img": {
                        borderRadius: 3,
                     },
                  }}
               >
                  <Image
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
   )
}

export default BlogCarousel
