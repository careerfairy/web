import {
   GenericCarousel,
   GenericCarouselProps,
} from "components/views/common/carousels/GenericCarousel"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React from "react"

type ResponsiveCarouselProps = {
   children: GenericCarouselProps["children"]
   disableSwipe?: boolean
}

const plugins = [WheelGesturesPlugin()]

export const SparksCarousel = ({
   children,
   disableSwipe,
}: ResponsiveCarouselProps) => {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         active: !disableSwipe,
      },
      plugins
   )

   const gap = 12
   const slideWidth = 265 + gap

   return (
      <GenericCarousel
         gap={`${gap}px`}
         emblaRef={emblaRef}
         emblaApi={emblaApi}
         preventEdgeTouch
      >
         {React.Children.map(children, (child) => (
            <GenericCarousel.Slide
               slideWidth={`${slideWidth}px`}
               key={child.key}
            >
               {child}
            </GenericCarousel.Slide>
         ))}
      </GenericCarousel>
   )
}
