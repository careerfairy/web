import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import Box from "@mui/material/Box"
import { sxStyles } from "types/commonTypes"
import { FC } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"

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
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
})

type PropType = {
   options?: EmblaOptionsType
   sparks: Spark[]
}

const SparksCarousel: FC<PropType> = (props) => {
   const { options, sparks } = props
   const [emblaRef, emblaApi] = useEmblaCarousel(options)

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Box sx={styles.container}>
            {sparks.map((spark) => (
               <Box key={spark.id} sx={styles.slide}>
                  <SparkCarouselCard spark={spark} />
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
