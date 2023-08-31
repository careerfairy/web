import { sxStyles } from "types/commonTypes"

import { Collapse } from "@mui/material"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress" // Import CircularProgress for the loader
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { EngineType } from "embla-carousel/components/Engine"
import { FC, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { swipeNextSparkByIndex } from "store/reducers/sparksFeedReducer"

import useVerticalMouseScrollNavigation from "components/custom-hook/embla-carousel/useVerticalMouseScrollNavigation"
import {
   currentSparkIndexSelector,
   isFetchingSparksSelector,
   sparksSelector,
} from "store/selectors/sparksFeedSelectors"
import useKeyboardNavigation from "../../custom-hook/embla-carousel/useKeyboardNavigation"
import CloseSparksFeedButton from "./CloseSparksFeedButton"
import FeedCardSlide from "./FeedCardSlide"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"

const slideSpacing = 32 // in pixels
const slideHeight = "90%"
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
      position: "relative",
      backgroundColor: "#F7F8FC",
      justifyContent: "center",
      alignItems: "center",
   },
   fullScreenViewport: {
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
   fullScreenContainer: {
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
   fullScreenSlide: {
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
   closeBtn: {
      position: "fixed",
      top: 0,
      right: 0,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      p: 1.5,
   },
})

const options: EmblaOptionsType = {
   axis: "y",
   loop: false,
   align: "center",
   /**
    * Custom function to watch for changes to the slides.
    * Reloads the Embla Carousel whenever the slides (sparks) are updated,
    * to prevent flickering.
    */
   watchSlides: (emblaApi) => {
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
}

const SparksFeedCarousel: FC = () => {
   const isFullScreen = useSparksFeedIsFullScreen()
   const currentPlayingIndex = useSelector(currentSparkIndexSelector)

   const dispatch = useDispatch()
   const sparks = useSelector(sparksSelector)
   const isFetchingSparks = useSelector(isFetchingSparksSelector)

   const [emblaRef, emblaApi] = useEmblaCarousel(options)

   /**
    * Custom plugin hooks for Embla Carousel
    */
   useKeyboardNavigation(emblaApi, "upDown")
   useVerticalMouseScrollNavigation(emblaApi)

   /**
    * When the current playing spark changes,
    * scroll to the new slide
    */
   useEffect(() => {
      if (emblaApi) {
         emblaApi.scrollTo(currentPlayingIndex)
      }
   }, [emblaApi, currentPlayingIndex])

   /**
    * When the user swipes to a new slide,
    * update the current playing spark in redux
    */
   useEffect(() => {
      if (emblaApi) {
         const onSelect = () => {
            const index = emblaApi.selectedScrollSnap()
            dispatch(swipeNextSparkByIndex(index))
         }

         emblaApi.on("select", onSelect)

         // Cleanup: remove the event listener if the component unmounts or sparks changes
         return () => {
            emblaApi.off("select", onSelect)
         }
      }
   }, [emblaApi, dispatch])

   const handlClickSlide = useCallback(
      (index: number) => {
         dispatch(swipeNextSparkByIndex(index))
      },
      [dispatch]
   )

   return (
      <Box
         sx={[styles.viewport, isFullScreen && styles.fullScreenViewport]}
         ref={emblaRef}
      >
         <Box
            sx={[styles.container, isFullScreen && styles.fullScreenContainer]}
         >
            {sparks.map((spark, index) => (
               <Slide
                  onClick={
                     index === currentPlayingIndex
                        ? undefined // Prevents propagating the click event to children
                        : () => handlClickSlide(index)
                  }
                  fullScreen={isFullScreen}
                  key={spark.id + index}
               >
                  <FeedCardSlide
                     playing={index === currentPlayingIndex}
                     spark={spark}
                  />
               </Slide>
            ))}
            <Collapse in={isFetchingSparks} unmountOnExit>
               <Slide fullScreen={isFullScreen}>
                  <CircularProgress />
               </Slide>
            </Collapse>
         </Box>
         {isFullScreen ? (
            <Box sx={styles.closeBtn}>
               <CloseSparksFeedButton />
            </Box>
         ) : null}
      </Box>
   )
}

type SlideProps = {
   fullScreen: boolean
} & React.HTMLAttributes<HTMLDivElement>

const Slide: FC<SlideProps> = ({ children, fullScreen, ...props }) => {
   return (
      <Box sx={[styles.slide, fullScreen && styles.fullScreenSlide]} {...props}>
         {children}
      </Box>
   )
}

export default SparksFeedCarousel
