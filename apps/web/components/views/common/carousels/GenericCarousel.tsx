import { Box, SxProps } from "@mui/material"
import useEmblaCarousel, {
   EmblaOptionsType,
   EmblaPluginType,
} from "embla-carousel-react"
import React, { ReactNode, useCallback, useEffect, useRef } from "react"
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
}

export const GenericCarousel = ({
   children,
   options,
   plugins,
   gap,
   slideWidth,
   sx,
   containerSx,
   slideSx,
}: EmblaCarouselProps) => {
   const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins)
   const emblaContainerRef = useRef<HTMLDivElement>(null)

   const onSelect = useCallback(() => {
      if (!emblaApi) return
   }, [emblaApi])

   useEffect(() => {
      if (!emblaApi) return
      emblaApi.on("select", onSelect)
      return () => {
         emblaApi.off("select", onSelect)
      }
   }, [emblaApi, onSelect])

   return (
      <Box
         id="generic-embla-carousel"
         sx={combineStyles(styles.viewport, sx)}
         ref={emblaRef}
      >
         <Box
            id="generic-embla-carousel-container"
            ref={emblaContainerRef}
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
   )
}
