import { sxStyles } from "types/commonTypes"

import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import useEmblaCarousel from "embla-carousel-react"
import { FC, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { swipeNextSparkByIndex } from "store/reducers/sparksFeedReducer"
import {
   currentSparkIndexSelector,
   isFetchingNextSparksSelector,
   sparksSelector,
} from "store/selectors/sparksFeedSelectors"
import CircularProgress from "@mui/material/CircularProgress" // Import CircularProgress for the loader

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
      color: "white",
   },
   slideImg: {
      display: "block",
      height: "100%",
      width: "100%",
      objectFit: "cover",
   },
})

const SparksFeedCarousel: FC = () => {
   const currentPlayingIndex = useSelector(currentSparkIndexSelector)

   const dispatch = useDispatch()
   const sparks = useSelector(sparksSelector)
   const isFetchingNextSparks = useSelector(isFetchingNextSparksSelector)

   const [emblaRef, emblaApi] = useEmblaCarousel({
      axis: "y",
      loop: false,
   })

   useEffect(() => {
      if (emblaApi) {
         emblaApi.scrollTo(currentPlayingIndex)
      }
   }, [emblaApi, currentPlayingIndex])

   useEffect(() => {
      if (emblaApi) {
         const onSelect = () => {
            const index = emblaApi.selectedScrollSnap()
            if (index >= 0 && index < sparks.length) {
               dispatch(swipeNextSparkByIndex(index))
            } else {
               console.log("Index out of bounds:", index)
            }
         }

         emblaApi.on("select", onSelect)

         // // Cleanup: remove the event listener if the component unmounts or sparks changes
         return () => {
            emblaApi.off("select", onSelect)
         }
      }
   }, [emblaApi, dispatch, sparks.length])

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Box sx={styles.container}>
            {sparks.map((spark, index) => (
               <Box sx={styles.slide} key={spark.id}>
                  <Box
                     position="absolute"
                     top="0"
                     left="0"
                     padding={`${slideSpacing}px`}
                  >
                     <Typography variant="h6">{spark.id}</Typography>
                     <Typography variant="body1">{spark.question}</Typography>
                  </Box>
                  <Box
                     component="img"
                     sx={styles.slideImg}
                     src={spark.video.thumbnailUrl}
                     // src={getResizedUrl(spark.video.thumbnailUrl)}
                     alt="Your alt text"
                  />
               </Box>
            ))}
            {isFetchingNextSparks ? (
               <Box
                  className="embla-infinite-scroll"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
               >
                  <CircularProgress /> {/* Loading indicator */}
               </Box>
            ) : null}
         </Box>
      </Box>
   )
}

export default SparksFeedCarousel
