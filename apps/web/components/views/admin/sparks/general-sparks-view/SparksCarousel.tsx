import React, { ReactNode, useCallback, useEffect, useState } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import SparkCarouselCardForAdmin from "components/views/sparks/components/spark-card/SparkCarouselCardForAdmin"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"
import useEmblaCarousel, {
   EmblaCarouselType,
   EmblaOptionsType,
} from "embla-carousel-react"
import { sxStyles } from "types/commonTypes"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import useIsMobile from "components/custom-hook/useIsMobile"

const slideSpacing = 21
const desktopSlideWidth = 306 + slideSpacing
const mobileSlideWidth = 280 + slideSpacing

const styles = sxStyles({
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      marginLeft: `calc(${slideSpacing}px * -1)`,
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      paddingLeft: `${slideSpacing}px`,
      position: "relative",
      height: {
         xs: 405,
         md: 443,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
})

export type ChildRefType = {
   goNext: () => void
   goPrev: () => void
}

type PropType = {
   options?: EmblaOptionsType
   sparks?: Spark[]
   onSparkClick?: (spark: Spark) => void
   children?: ReactNode[]
   isAdmin?: boolean
}

const SparksCarousel = React.forwardRef<ChildRefType, PropType>(
   (props, ref) => {
      const { options, sparks, onSparkClick, children, isAdmin } = props
      const isMobile = useIsMobile()
      const [activeSparkIndex, setActiveSparkIndex] = useState(0)
      const [emblaRef, emblaApi] = useEmblaCarousel(
         { ...options, ...{ inViewThreshold: 0.9 } },
         [WheelGesturesPlugin()]
      )

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      // Function to handle auto-playing on mobile
      const handleMobileActiveSpark = useCallback(
         (emblaApi: EmblaCarouselType) => {
            if (sparks?.length) {
               const inViewIndexes = emblaApi.slidesInView()

               let activeIndex: number
               const lastPosition = sparks.length - 1

               if (
                  inViewIndexes.length > 1 &&
                  inViewIndexes.includes(lastPosition)
               ) {
                  activeIndex = lastPosition // Set the active index to the last position if the last card is in view
               } else {
                  activeIndex = inViewIndexes[0] // Set the active index to the first slide if not at the last position
               }

               setActiveSparkIndex(activeIndex)
            }
         },
         [sparks?.length]
      )

      // Add event listener for 'slidesInView' to handle mobile auto-play
      useEffect(() => {
         if (emblaApi && isMobile) {
            emblaApi.on("slidesInView", handleMobileActiveSpark)

            return () => {
               // Clean up event listener for 'slidesInView'
               emblaApi.off("slidesInView", handleMobileActiveSpark)
            }
         }
      }, [emblaApi, handleMobileActiveSpark, isMobile])

      return (
         <Box sx={styles.viewport} ref={emblaRef}>
            <Box sx={styles.container}>
               {sparks?.length
                  ? sparks.map((spark, index) => (
                       <Box key={spark.id} sx={styles.slide}>
                          {isAdmin ? (
                             <SparkCarouselCardForAdmin
                                onClick={() => onSparkClick(spark)}
                                spark={spark}
                             />
                          ) : (
                             <SparkCarouselCard
                                onClick={() => onSparkClick(spark)}
                                spark={spark}
                                onGoNext={() => emblaApi.scrollNext()}
                                mobileActiveSpark={
                                   isMobile ? index === activeSparkIndex : false
                                }
                             />
                          )}
                       </Box>
                    ))
                  : children?.map((child, i) => (
                       <Box key={i} sx={styles.slide}>
                          {child}
                       </Box>
                    ))}
               {/**
                * This prevents the last slide from touching the right edge of the viewport.
                */}
               <Box sx={styles.paddingSlide}></Box>
            </Box>
         </Box>
      )
   }
)

SparksCarousel.displayName = "SparksCarousel"

export default SparksCarousel
