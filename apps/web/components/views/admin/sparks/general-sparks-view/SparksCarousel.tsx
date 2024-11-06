import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import SparkPreviewCardForAdmin from "components/views/sparks/components/spark-card/SparkPreviewCardForAdmin"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React, { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const slideSpacing = 21

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
      paddingLeft: `${slideSpacing}px`,
      position: "relative",
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
      const [emblaRef, emblaApi] = useEmblaCarousel(options, [
         WheelGesturesPlugin(),
      ])

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      return (
         <Box sx={styles.viewport} ref={emblaRef}>
            <Box sx={styles.container}>
               {sparks?.length
                  ? sparks.map((spark) => (
                       <Box key={spark.id} sx={styles.slide}>
                          {isAdmin ? (
                             <SparkPreviewCardForAdmin
                                onClick={() => onSparkClick?.(spark)}
                                spark={spark}
                             />
                          ) : (
                             <SparkPreviewCard
                                onClick={() => onSparkClick?.(spark)}
                                spark={spark}
                                onGoNext={() => emblaApi.scrollNext()}
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
