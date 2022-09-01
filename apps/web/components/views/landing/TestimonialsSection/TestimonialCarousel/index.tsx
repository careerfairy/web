import React, { useCallback, useMemo } from "react"
import testimonialData from "../testimonialData"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Slider from "react-slick"
import TestimonialCard from "./TestimonialCard"
import { Testimonial } from "../../../../../types/cmsTypes"
import {
   SampleNextArrow,
   SamplePrevArrow,
} from "../../../common/carousels/arrows"
import TestimonialCardV2 from "./TestimonialCardV2"
import { IColors } from "../../../../../types/commonTypes"

const TestimonialCarousel = ({ testimonials, sliderArrowColor }: Props) => {
   // settings for the slider component
   const settings = useMemo(
      () => ({
         dots: !testimonials,
         lazyLoad: true,
         infinite: true,
         autoplay: true,
         pauseOnHover: true,
         speed: 500,
         slidesToShow: getNumberOfSlides(testimonials),
         slidesToScroll: getNumberOfSlides(testimonials),
         nextArrow: <SampleNextArrow color={sliderArrowColor} />,
         prevArrow: <SamplePrevArrow color={sliderArrowColor} />,
         initialSlide: 0,
         autoplaySpeed: 10000,
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
         responsive: [
            {
               breakpoint: 1024,
               settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  infinite: true,
               },
            },
         ],
      }),
      [sliderArrowColor, testimonials]
   )

   const handleRenderTestimonials = useCallback(() => {
      if (testimonials?.length) {
         return renderTestimonials(testimonials)
      }

      return renderPlaceHolderTestimonials()
   }, [testimonials])

   return <Slider {...settings}>{handleRenderTestimonials()}</Slider>
}

/**
 * To dynamically render the testimonials with the V2 layout
 */
const renderTestimonials = (testimonials: Testimonial[]) => {
   return testimonials.map((testimonial) => {
      return <TestimonialCardV2 key={testimonial.id} {...testimonial} />
   })
}

/**
 * To render the hard coded testimonials with the old layout
 */
const renderPlaceHolderTestimonials = () => {
   return testimonialData.map((testimonial) => (
      <TestimonialCard key={testimonial.avatarUrl} {...testimonial} />
   ))
}

/**
 * To get the number of slides for the carousel
 */
const getNumberOfSlides = (testimonials: Testimonial[]): number => {
   if (testimonials?.length) {
      return testimonials.length < 3 ? testimonials.length : 3
   }

   return 1
}

type Props = {
   testimonials?: Testimonial[]
   sliderArrowColor?: IColors
}

export default TestimonialCarousel
