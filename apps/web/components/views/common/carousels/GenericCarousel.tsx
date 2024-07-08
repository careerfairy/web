import { Box, BoxProps, SxProps } from "@mui/material"
import {
   EmblaCarouselType,
   EmblaOptionsType,
   EmblaPluginType,
   UseEmblaCarouselType,
} from "embla-carousel-react"
import { ReactElement, createContext, useContext, useMemo } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   viewport: {
      overflow: "hidden" /* Full-width viewport */,
      width: "100%",
   },
   container: {
      display: "flex" /* Flexbox for slides */,
      backfaceVisibility: "hidden" /* Hide backface during transitions */,
      touchAction:
         "pan-y pinch-zoom" /* Allow vertical panning and pinch-zoom */,
   },
   slide: {
      minWidth: 0,
      maxWidth: "100%" /* Prevent from growing larger than viewport */,
   },
})

type GenericCarouselContextType = {
   gap: string
   emblaApi: EmblaCarouselType | undefined
}

const EmblaCarouselContext = createContext<
   GenericCarouselContextType | undefined
>(undefined)

export type SlideElement = ReactElement<SlideProps>

export type GenericCarouselProps = {
   /** children must be Slide components */
   children: SlideElement | SlideElement[]
   options?: EmblaOptionsType
   plugins?: EmblaPluginType[]
   /** The gap between the slides can be in any css unit */
   gap?: string
   sx?: SxProps
   containerSx?: SxProps
   emblaRef: UseEmblaCarouselType[0]
   emblaApi: UseEmblaCarouselType[1]
   /** Prevents the last slide from touching the edge of the viewport */
   preventEdgeTouch?: boolean
}

export const GenericCarousel = ({
   children,
   gap,
   sx,
   containerSx,
   emblaRef,
   emblaApi,
   preventEdgeTouch,
}: GenericCarouselProps) => {
   const value = useMemo<GenericCarouselContextType>(
      () => ({ gap, emblaApi }),
      [gap, emblaApi]
   )

   return (
      <EmblaCarouselContext.Provider value={value}>
         <Box
            id="generic-embla-carousel-viewport"
            sx={combineStyles(styles.viewport, sx)}
            ref={emblaRef}
         >
            <Box
               id="generic-embla-carousel-container"
               marginLeft={`calc(${gap} * -1)`}
               sx={combineStyles(styles.container, containerSx)}
            >
               {children}
               {Boolean(preventEdgeTouch) && <GenericCarousel.Slide />}
            </Box>
         </Box>
      </EmblaCarouselContext.Provider>
   )
}

type SlideProps = BoxProps & {
   /** The width of the slide can be in any css unit.
    * If not provided, the slide will take the width of each child
    * */
   slideWidth?: string
}

const Slide = ({ children, slideWidth, sx, ...props }: SlideProps) => {
   const { gap } = useGenericCarousel()

   return (
      <Box
         id="generic-embla-carousel-slide"
         paddingLeft={gap}
         sx={combineStyles(styles.slide, sx)}
         flex={slideWidth ? `0 0 ${slideWidth}` : "0 0 auto"}
         {...props}
      >
         {children}
      </Box>
   )
}

GenericCarousel.Slide = Slide

/**
 * Custom hook to access the GenericCarousel context.
 * @returns the gap and emblaApi
 */
export const useGenericCarousel = (): GenericCarouselContextType => {
   return useContext(EmblaCarouselContext)
}
