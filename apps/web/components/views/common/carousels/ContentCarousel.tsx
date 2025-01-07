import { Stack, SxProps, Typography, TypographyProps } from "@mui/material"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import {
   GenericCarousel,
   GenericCarouselProps,
} from "components/views/common/carousels/GenericCarousel"
import useEmblaCarousel, {
   EmblaOptionsType,
   UseEmblaCarouselType,
} from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, { ReactNode, useCallback, useRef } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      position: "relative",
      flexDirection: "row",
      gap: 2,
   },
   title: {
      fontWeight: 600,
      color: "neutral.900",
   },
})

type ContentCarouselProps = Pick<GenericCarouselProps, "children"> & {
   slideWidth?: number
   headerTitle?: ReactNode | string
   viewportSx?: SxProps
   containerSx?: SxProps
   headerSx?: SxProps
   emblaProps?: {
      emblaRef?: UseEmblaCarouselType[0]
      emblaApi?: UseEmblaCarouselType[1]
      emblaOptions?: EmblaOptionsType
   }
   disableArrows?: boolean
}

export const ContentCarousel = ({
   children,
   slideWidth,
   headerTitle,
   viewportSx,
   containerSx,
   headerSx,
   emblaProps,
   disableArrows = false,
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
      if (!carouselContainerRef.current || disableArrows) return false

      return (
         isDesktop &&
         carouselContainerRef.current?.clientWidth <
            carouselContainerRef.current?.scrollWidth
      )
   }, [isDesktop, carouselContainerRef, disableArrows])

   return (
      <Stack display="grid" gap="16px">
         {Boolean(headerTitle) || shouldShowArrows() ? (
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems="center"
               sx={headerSx}
            >
               {typeof headerTitle === "string" ? (
                  <HeaderTitle>{headerTitle}</HeaderTitle>
               ) : (
                  Boolean(headerTitle) && headerTitle
               )}
               {shouldShowArrows() && (
                  <GenericCarousel.Arrows
                     emblaApi={emblaProps?.emblaApi || emblaApi}
                  />
               )}
            </Stack>
         ) : null}
         <GenericCarousel
            emblaApi={emblaProps?.emblaApi || emblaApi}
            emblaRef={emblaProps?.emblaRef || emblaRef}
            containerSx={combineStyles(styles.container, containerSx)}
            sx={viewportSx}
            containerRef={carouselContainerRef}
            preventEdgeTouch
         >
            {React.Children.map(children, (child) => (
               <GenericCarousel.Slide
                  slideWidth={slideWidth ? `${slideWidth}px` : null}
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
