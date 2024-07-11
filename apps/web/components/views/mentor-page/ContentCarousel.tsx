import { Stack } from "@mui/material"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import {
   GenericCarousel,
   GenericCarouselProps,
} from "../common/carousels/GenericCarousel"

const styles = sxStyles({
   viewport: {
      // hack to ensure shadows are not cut off
      padding: 2,
      marginLeft: -2,
   },
   container: {
      position: "relative",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 2,
   },
})

type ContentCarouselProps = Pick<GenericCarouselProps, "children"> & {
   slideWidth: number
   headerTitle: ReactNode
}

export const ContentCarousel = ({
   children,
   slideWidth,
   headerTitle,
}: ContentCarouselProps) => {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
      },
      [WheelGesturesPlugin()]
   )

   const isDesktop = useIsDesktop()

   return (
      <Stack>
         <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
         >
            {headerTitle}
            {Boolean(isDesktop && emblaApi?.slidesNotInView) && (
               <GenericCarousel.Arrows emblaApi={emblaApi} />
            )}
         </Stack>
         <GenericCarousel
            emblaApi={emblaApi}
            emblaRef={emblaRef}
            sx={styles.viewport}
            containerSx={styles.container}
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
      </Stack>
   )
}
