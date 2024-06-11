import { Box, SxProps } from "@mui/material"
import {
   EmblaCarouselType,
   EmblaOptionsType,
   EmblaPluginType,
   UseEmblaCarouselType,
} from "embla-carousel-react"
import React, { ReactNode, createContext, useContext } from "react"
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

const EmblaCarouselContext = createContext<EmblaCarouselType | undefined>(
   undefined
)

type EmblaCarouselProps = {
   children: ReactNode
   options?: EmblaOptionsType
   plugins?: EmblaPluginType[]
   /** The gap between the slides can be in any css unit */
   gap?: string
   /** The width of the slide can be in any css unit.
    * If not provided, the slide will take the width of each child
    * */
   slideWidth?: string
   sx?: SxProps
   containerSx?: SxProps
   slideSx?: SxProps
   emblaRef: UseEmblaCarouselType[0]
   emblaApi: UseEmblaCarouselType[1]
}

export const GenericCarousel = ({
   children,
   gap,
   slideWidth,
   sx,
   containerSx,
   slideSx,
   emblaRef,
   emblaApi,
}: EmblaCarouselProps) => {
   return (
      <EmblaCarouselContext.Provider value={emblaApi}>
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
               {React.Children.map(children, (child) => (
                  <Box
                     id="generic-embla-carousel-slide"
                     paddingLeft={gap}
                     sx={combineStyles(styles.slide, slideSx)}
                     flex={slideWidth ? `0 0 ${slideWidth}` : "0 0 auto"}
                  >
                     {child}
                  </Box>
               ))}
            </Box>
         </Box>
      </EmblaCarouselContext.Provider>
   )
}

/**
 * Custom hook to access the EmblaCarousel context.
 * Throws an error if used outside of an EmblaCarouselContext.Provider.
 * @returns {EmblaCarouselType} The EmblaCarousel API.
 */
export const useGenericCarousel = (): EmblaCarouselType => {
   const context = useContext(EmblaCarouselContext)

   if (context === undefined) {
      throw new Error(
         "useEmblaCarouselContext must be used within an EmblaCarouselContext.Provider"
      )
   }
   return context
}
