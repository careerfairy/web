import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { useAutoPlaySparks } from "components/custom-hook/spark/useAutoPlaySparks"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import SparkPreviewCardForAdmin from "components/views/sparks/components/spark-card/SparkPreviewCardForAdmin"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ReactNode } from "react"
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

const SparksCarousel = ({
   options,
   sparks,
   onSparkClick,
   isAdmin,
   children,
}: PropType) => {
   const [emblaRef, emblaApi] = useEmblaCarousel(options, [
      WheelGesturesPlugin(),
   ])

   const { shouldDisableAutoPlay, moveToNextSlide } = useAutoPlaySparks(
      sparks?.length ?? null,
      emblaApi
   )

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Box sx={styles.container}>
            {sparks?.length
               ? sparks.map((spark, index) => (
                    <Box key={spark.id} sx={styles.slide}>
                       {isAdmin ? (
                          <SparkPreviewCardForAdmin
                             onClick={() => onSparkClick?.(spark)}
                             spark={spark}
                          />
                       ) : (
                          <SparkPreviewCard
                             spark={spark}
                             onClick={() => onSparkClick?.(spark)}
                             onGoNext={moveToNextSlide}
                             disableAutoPlay={shouldDisableAutoPlay(index)}
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

SparksCarousel.displayName = "SparksCarousel"

export default SparksCarousel
