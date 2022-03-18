import React, { FC, useEffect, useMemo, useState } from "react"

import Slider from "react-slick"
import { Box } from "@mui/material"
import { SxProps } from "@mui/system"
import { Theme } from "@mui/material/styles"

interface BasicCarouselProps {
   accessibility?: boolean
   adaptiveHeight?: boolean
   afterChange?: (index: number) => any
   appendDots?: (dots: JSX.Element) => any
   arrows?: boolean
   autoplay?: boolean
   autoplaySpeed?: number
   beforeChange?: (oldIndex: number, newIndex: number) => any
   centerMode?: boolean
   centerPadding?: string
   className?: string
   cssEase?: "ease" | "ease-in-out" | string
   customPaging?: (index: number) => any
   dots?: boolean
   dotsClass?: string
   draggable?: boolean
   easing?: "linear" | string
   edgeFriction?: number
   fade?: boolean
   focusOnSelect?: boolean
   infinite?: boolean
   initialSlide?: number
   lazyLoad?: boolean
   nextArrow?: JSX.Element
   onEdge?: (direction: string) => any
   onInit?: () => void
   onLazyLoadError?: (error: any) => void
   onReInit?: () => void
   pauseOnDotsHover?: boolean
   pauseOnFocus?: boolean
   pauseOnHover?: boolean
   prevArrow?: JSX.Element
   responsive?: any[]
   rows?: number
   rtl?: boolean
   slide?: string
   slidesPerRow?: number
   slidesToScroll?: number
   slidesToShow?: number
   speed?: number
   swipe?: boolean
   swipeEvent?: () => void
   swipeToSlide?: boolean
   touchMove?: boolean
   touchThreshold?: number
   useCSS?: boolean
   useTransform?: boolean
   variableWidth?: boolean
   vertical?: boolean
   waitForAnimate?: boolean
   sx?: SxProps<Theme>
}
const BasicCarousel: FC<BasicCarouselProps> = (props) => {
   const [isClient, setIsClient] = useState(false)
   useEffect(() => {
      setIsClient(true)
   }, [])

   const propsWithDefaults = useMemo(
      () => ({
         dots: true,
         infinite: true,
         speed: 500,
         slidesToShow: 1,
         slidesToScroll: 1,
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
         ...props,
      }),
      [props]
   )

   return (
      <Box
         sx={[
            // You cannot spread `sx` directly because `SxProps` (typeof sx) can be an array.
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
         ]}
      >
         <Slider
            key={isClient ? "client" : "server"}
            responsive={isClient ? propsWithDefaults.responsive : null}
            {...propsWithDefaults}
         >
            {props.children}
         </Slider>
      </Box>
   )
}

export default BasicCarousel
