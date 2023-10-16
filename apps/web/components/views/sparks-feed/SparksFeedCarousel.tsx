import { sxStyles } from "types/commonTypes"

import { Collapse } from "@mui/material"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress" // Import CircularProgress for the loader
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { EngineType } from "embla-carousel/components/Engine"
import React, { FC, useCallback, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   removeCurrentEventNotifications,
   swipeToSparkByIndex,
} from "store/reducers/sparksFeedReducer"

import useVerticalMouseScrollNavigation from "components/custom-hook/embla-carousel/useVerticalMouseScrollNavigation"
import {
   currentSparkIndexSelector,
   isFetchingSparksSelector,
   eventDetailsDialogVisibilitySelector,
   sparksSelector,
   emptyFilterSelector,
   cameFromCompanyPageLinkSelector,
} from "store/selectors/sparksFeedSelectors"
import useKeyboardNavigation from "../../custom-hook/embla-carousel/useKeyboardNavigation"
import CloseSparksFeedButton from "./CloseSparksFeedButton"
import FeedCardSlide from "./FeedCardSlide"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"
import SparkNotifications from "./SparkNotifications"
import { useAuth } from "../../../HOCs/AuthProvider"
import EmptyFilterView from "./EmptyFilterView"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { IconButton } from "@mui/material"
import Link from "../common/Link"

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
   companyPageBtn: {
      position: "absolute",
      top: 0,
      left: 0,
      p: 5,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      "& .MuiIconButton-root": {
         background: "#DEDEDE",
         color: "#5C5C5C",
      },
   },
})

const SparksFeedCarousel: FC = () => {
   const isFullScreen = useSparksFeedIsFullScreen()
   const dispatch = useDispatch()
   const { userData } = useAuth()

   const currentPlayingIndex = useSelector(currentSparkIndexSelector)
   const emptyFilter = useSelector(emptyFilterSelector)
   const sparks = useSelector(sparksSelector)
   const isFetchingSparks = useSelector(isFetchingSparksSelector)
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )

   const noSparks = sparks.length === 0

   const options = useMemo<EmblaOptionsType>(
      () => ({
         active: !eventDetailsDialogVisibility,
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
                  Object.assign(
                     newEngine[engineModule],
                     oldEngine[engineModule]
                  )
               })
               if (noSparks) return
               newEngine.translate.to(oldEngine.location.get())
               const { index } = newEngine.scrollTarget.byDistance(0, false)
               newEngine.index.set(index)
               newEngine.animation.start()
            }

            reloadEmbla()
         },
      }),
      [eventDetailsDialogVisibility, noSparks]
   )

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
            dispatch(swipeToSparkByIndex(index))
            dispatch(removeCurrentEventNotifications())
         }

         emblaApi.on("select", onSelect)

         // Cleanup: remove the event listener if the component unmounts or sparks changes
         return () => {
            emblaApi.off("select", onSelect)
         }
      }
   }, [emblaApi, dispatch])

   const handleClickSlide = useCallback(
      (index: number) => {
         dispatch(swipeToSparkByIndex(index))
      },
      [dispatch]
   )

   const start = Math.max(currentPlayingIndex - 1, 0)
   const end = Math.min(currentPlayingIndex + 2, sparks.length)

   // Create the slice
   const sparksSlice = useMemo(
      () => sparks.slice(start, end),
      [sparks, start, end]
   )

   return (
      <Box
         sx={[styles.viewport, isFullScreen && styles.fullScreenViewport]}
         ref={emblaRef}
      >
         <Box
            sx={[styles.container, isFullScreen && styles.fullScreenContainer]}
         >
            {emptyFilter ? <EmptyFeedSlide fullScreen={isFullScreen} /> : null}
            {sparksSlice.map((spark, index) => {
               const absoluteIndex = start + index // Adjust the index for the slice
               const playing = absoluteIndex === currentPlayingIndex

               return (
                  <Slide
                     onClick={
                        playing
                           ? undefined // Prevents propagating the click event to children
                           : () => handleClickSlide(index)
                     }
                     fullScreen={isFullScreen}
                     key={spark.id + index}
                  >
                     <FeedCardSlide playing={playing} spark={spark} />
                  </Slide>
               )
            })}
            <Collapse in={isFetchingSparks} unmountOnExit>
               <Slide fullScreen={isFullScreen}>
                  <CircularProgress />
               </Slide>
            </Collapse>
         </Box>
         <Box sx={styles.companyPageBtn}>
            <BackToCompanyPageButton />
         </Box>
         {isFullScreen ? (
            <Box sx={styles.closeBtn}>
               <CloseSparksFeedButton dark={emptyFilter} />
            </Box>
         ) : null}

         {userData?.userEmail ? (
            <SparkNotifications userEmail={userData.userEmail} />
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

const EmptyFeedSlide: FC<SlideProps> = ({ fullScreen }) => {
   return (
      <Slide fullScreen={fullScreen}>
         <EmptyFilterView />
      </Slide>
   )
}

const BackToCompanyPageButton: FC = () => {
   const cameFromCompanyPageLink = useSelector(cameFromCompanyPageLinkSelector)

   const isFullScreen = useSparksFeedIsFullScreen()

   if (!cameFromCompanyPageLink || isFullScreen) return null

   return (
      <IconButton component={Link} href={cameFromCompanyPageLink}>
         <ArrowBackRoundedIcon color="inherit" />
      </IconButton>
   )
}

export default SparksFeedCarousel
