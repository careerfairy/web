import { sxStyles } from "types/commonTypes"

import { Collapse } from "@mui/material"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress" // Import CircularProgress for the loader
import useEmblaCarousel from "embla-carousel-react"
import { EngineType } from "embla-carousel/components/Engine"
import { FC, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { swipeNextSparkByIndex } from "store/reducers/sparksFeedReducer"

import useIsMobile from "components/custom-hook/useIsMobile"
import {
   currentSparkIndexSelector,
   isFetchingSparksSelector,
   sparksSelector,
} from "store/selectors/sparksFeedSelectors"
import useKeyboardNavigation from "../../components/custom-hook/embla-carousel/useKeyboardNavigation"
import FeedCard from "./FeedCard"

const slideSpacing = 32 // in pixels, equivalent to 1rem
const slideHeight = "90%" // in pixels, equivalent to 19rem
const slideSize = "100%"

const styles = sxStyles({
   root: {
      display: "flex",
   },
   viewport: {
      padding: "1.6rem",
      overflow: "hidden",
      display: "flex",
      flexGrow: 1,
      height: "calc(100dvh - 64px - 3.2rem)",
   },
   mobileViewport: {
      height: "100dvh",
      position: "fixed",
      width: "100%",
      zIndex: (theme) => theme.zIndex.drawer + 1,
      padding: 0,
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-x",
      marginTop: `calc(${slideSpacing}px * -1)`,
      height: `calc(${slideSpacing}px + ${slideHeight})`,
      flexDirection: "column",
      width: "100%",
   },
   mobileContainer: {
      height: "100%",
      marginTop: 0,
   },
   slide: {
      flex: `0 0 ${slideSize}`,
      minHeight: 0,
      paddingTop: `${slideSpacing}px`,
      position: "relative",
      color: "white",
      display: "flex",
      justifyContent: "center",
   },
   mobileSlide: {
      flex: "1 0 auto",
      height: "100%",
      paddingTop: 0,
   },
   slideImg: {
      display: "block",
      height: "100%",
      width: "100%",
      objectFit: "cover",
   },
})

const SparksFeedCarousel: FC = () => {
   const isMobile = useIsMobile()
   const currentPlayingIndex = useSelector(currentSparkIndexSelector)

   const dispatch = useDispatch()
   const sparks = useSelector(sparksSelector)
   const isFetchingSparks = useSelector(isFetchingSparksSelector)

   const [emblaRef, emblaApi] = useEmblaCarousel({
      axis: "y",
      loop: false,
      align: "center",
      watchSlides: (emblaApi) => {
         // Reload Embla Carousel whenever sparks slides are updated, to avoid flickering
         const reloadEmbla = (): void => {
            const oldEngine = emblaApi.internalEngine()
            emblaApi.reInit()
            const newEngine = emblaApi.internalEngine()
            const copyEngineModules: (keyof EngineType)[] = [
               "location",
               "target",
               "scrollBody",
            ]
            copyEngineModules.forEach((engineModule) => {
               Object.assign(newEngine[engineModule], oldEngine[engineModule])
            })
            newEngine.translate.to(oldEngine.location.get())
            const { index } = newEngine.scrollTarget.byDistance(0, false)
            newEngine.index.set(index)
            newEngine.animation.start()
         }

         reloadEmbla()
      },
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

         // Cleanup: remove the event listener if the component unmounts or sparks changes
         return () => {
            emblaApi.off("select", onSelect)
         }
      }
   }, [emblaApi, dispatch, sparks.length])

   useKeyboardNavigation(emblaApi, "upDown")

   return (
      <Box
         sx={[styles.viewport, isMobile && styles.mobileViewport]}
         ref={emblaRef}
      >
         <Box sx={[styles.container, isMobile && styles.mobileContainer]}>
            {sparks.map((spark, index) => (
               <Box
                  sx={[styles.slide, isMobile && styles.mobileSlide]}
                  key={spark.id}
               >
                  <FeedCard
                     playing={index === currentPlayingIndex}
                     spark={spark}
                  />
               </Box>
            ))}
            <Collapse in={isFetchingSparks} unmountOnExit>
               <Box sx={styles.slide}>
                  <CircularProgress />
               </Box>
            </Collapse>
         </Box>
      </Box>
   )
}

export default SparksFeedCarousel
