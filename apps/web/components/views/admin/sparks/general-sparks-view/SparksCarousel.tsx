import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

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

type PropType = {
   options?: EmblaOptionsType
   sparks?: Spark[]
   onSparkClick?: (spark: Spark) => void
   children?: ReactNode[]
}

const SparksCarousel: FC<PropType> = (props) => {
   const { options, sparks, onSparkClick, children } = props
   const [emblaRef, emblaApi] = useEmblaCarousel(options)

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Box sx={styles.container}>
            {sparks?.length
               ? sparks.map((spark) => (
                    <Box key={spark.id} sx={styles.slide}>
                       <SparkCarouselCard
                          onClick={() => onSparkClick(spark)}
                          spark={spark}
                       />
                    </Box>
                 ))
               : children.map((child, i) => (
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

export default SparksCarousel
