import { sxStyles } from "types/commonTypes"

import Box from "@mui/material/Box"
import useEmblaCarousel from "embla-carousel-react"
import { FC, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   currentSparkIndexSelector,
   sparksSelector,
} from "store/selectors/sparksFeedSelectors"

const slideSpacing = 16 // in pixels, equivalent to 1rem
const slideHeight = 600 // in pixels, equivalent to 19rem
const slideSize = "100%"

const styles = sxStyles({
   root: {
      display: "flex",
   },
   viewport: {
      padding: "1.6rem",
      border: "1px solid red",
      overflow: "hidden",
      display: "flex",
      flexGrow: 1,
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-x",
      marginTop: `calc(${slideSpacing}px * -1)`,
      height: `calc(${slideSpacing}px + ${slideHeight}px)`,
      flexDirection: "column",
   },
   slide: {
      flex: `0 0 ${slideSize}`,
      minHeight: 0,
      paddingTop: `${slideSpacing}px`,
      position: "relative",
   },
   slideImg: {
      display: "block",
      height: "100%",
      width: "100%",
      objectFit: "cover",
   },
})

const SparksFeedCarousel: FC = () => {
   const [emblaRef, emblaApi] = useEmblaCarousel({
      axis: "y",
   })

   const dispatch = useDispatch()
   const sparks = useSelector(sparksSelector)
   const currentPlayingIndex = useSelector(currentSparkIndexSelector)

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Box sx={styles.container}>
            {sparks.map((spark, index) => (
               <Box sx={styles.slide} key={index}>
                  <Box
                     component="img"
                     sx={styles.slideImg}
                     src={spark.video.thumbnailUrl}
                     alt="Your alt text"
                  />
               </Box>
            ))}
         </Box>
      </Box>
   )
}

export default SparksFeedCarousel
