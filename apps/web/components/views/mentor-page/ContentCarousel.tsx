import { Stack, SxProps, Typography, TypographyProps } from "@mui/material"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import useEmblaCarousel, {
   EmblaOptionsType,
   UseEmblaCarouselType,
} from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, { ReactNode, useCallback, useRef } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import {
   GenericCarousel,
   GenericCarouselProps,
} from "../common/carousels/GenericCarousel"

const styles = sxStyles({
   container: {
      position: "relative",
      flexDirection: "row",
      gap: 2,
   },
   title: {
      fontSize: "24px",
      fontWeight: 600,
      lineHeight: "36px",
      color: "neutral.900",
   },
})

type ContentCarouselProps = Pick<GenericCarouselProps, "children"> & {
   slideWidth: number
   headerTitle: ReactNode | string
   viewportSx?: SxProps
   containerSx?: SxProps
   emblaProps?: {
      emblaRef?: UseEmblaCarouselType[0]
      emblaApi?: UseEmblaCarouselType[1]
      emblaOptions?: EmblaOptionsType
   }
}

export const ContentCarousel = ({
   children,
   slideWidth,
   headerTitle,
   viewportSx,
   containerSx,
   emblaProps,
}: ContentCarouselProps) => {
   const carouselContainerRef = useRef<HTMLDivElement>(null)

   const [emblaRef, emblaApi] = useEmblaCarousel(
      emblaProps?.emblaOptions || {
         loop: false,
         axis: "x",
      },
      [WheelGesturesPlugin()]
   )

   const isDesktop = useIsDesktop()

   const shouldShowArrows = useCallback(() => {
      if (!carouselContainerRef.current) return false

      return (
         isDesktop &&
         carouselContainerRef.current?.clientWidth <
            carouselContainerRef.current?.scrollWidth
      )
   }, [isDesktop, carouselContainerRef])

   return (
      <Stack display="grid" gap="16px">
         <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
         >
            {typeof headerTitle === "string" ? (
               <HeaderTitle>{headerTitle}</HeaderTitle>
            ) : (
               headerTitle
            )}
            {shouldShowArrows() && (
               <GenericCarousel.Arrows
                  emblaApi={emblaProps?.emblaApi || emblaApi}
               />
            )}
         </Stack>
         <GenericCarousel
            emblaApi={emblaProps?.emblaApi || emblaApi}
            emblaRef={emblaProps?.emblaRef || emblaRef}
            containerSx={combineStyles(styles.container, containerSx)}
            sx={viewportSx}
            containerRef={carouselContainerRef}
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

const HeaderTitle = ({ children, sx, ...props }: TypographyProps) => {
   return (
      <Typography
         variant="brandedH3"
         sx={combineStyles(styles.title, sx)}
         {...props}
      >
         {children}
      </Typography>
   )
}

ContentCarousel.HeaderTitle = HeaderTitle
