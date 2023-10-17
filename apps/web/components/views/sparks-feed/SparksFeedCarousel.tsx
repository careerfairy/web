import { sxStyles } from "types/commonTypes"

import { Collapse } from "@mui/material"
import Box, { BoxProps } from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress" // Import CircularProgress for the loader
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { EngineType } from "embla-carousel/components/Engine"
import {
   FC,
   Ref,
   SyntheticEvent,
   forwardRef,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   removeCurrentEventNotifications,
   setVideoPlaying,
   setVideosMuted,
   swipeToSparkByIndex,
   togglePlaying,
} from "store/reducers/sparksFeedReducer"

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { IconButton } from "@mui/material"
import useVerticalMouseScrollNavigation from "components/custom-hook/embla-carousel/useVerticalMouseScrollNavigation"
import {
   activeSparkSelector,
   cameFromCompanyPageLinkSelector,
   currentSparkIndexSelector,
   emptyFilterSelector,
   eventDetailsDialogVisibilitySelector,
   isFetchingSparksSelector,
   isOnEdgeSelector,
   isPlayingSelector,
   sparksSelector,
   videosMuttedSelector,
} from "store/selectors/sparksFeedSelectors"
import { useAuth } from "../../../HOCs/AuthProvider"
import useKeyboardNavigation from "../../custom-hook/embla-carousel/useKeyboardNavigation"
import Link from "../common/Link"
import CloseSparksFeedButton from "./CloseSparksFeedButton"
import EmptyFilterView from "./EmptyFilterView"
import FeedCardSlide from "./FeedCardSlide"
import SparkNotifications from "./SparkNotifications"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"

const slideSpacing = 32 // in pixels
const slideHeight = "90%"
const slideSize = "100%"

const styles = sxStyles({
   root: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      position: "relative",
   },
   viewport: {
      padding: "1.6rem",
      overflow: "hidden",
      display: "flex",
      flexGrow: 1,
      height: "calc(100dvh - 64px - 3.2rem)",
      position: "relative",

      justifyContent: "center",
      alignItems: "center",
   },
   staticViewportVideo: {
      position: "absolute",
      inset: 0,
      backgroundColor: "transparent",
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
   const [scrolling, setScrolling] = useState(false)

   const isFullScreen = useSparksFeedIsFullScreen()
   const dispatch = useDispatch()
   const { userData } = useAuth()

   const currentPlayingIndex = useSelector(currentSparkIndexSelector)
   const emptyFilter = useSelector(emptyFilterSelector)
   const sparks = useSelector(sparksSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const isFetchingSparks = useSelector(isFetchingSparksSelector)
   const isPlaying = useSelector(isPlayingSelector)
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )
   const isOnEdge = useSelector(isOnEdgeSelector)
   const videoIsMuted = useSelector(videosMuttedSelector)

   const noSparks = sparks.length === 0

   const options = useMemo<EmblaOptionsType>(
      () => ({
         active: !eventDetailsDialogVisibility,
         axis: "y",
         loop: false,
         align: "center",
         duration: 15,
         dragFree: false,
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
      let timeoutId
      const onScroll = () => {
         setScrolling(true)
         clearTimeout(timeoutId)
         timeoutId = setTimeout(() => {
            setScrolling(false)
            if (emblaApi) {
               const nearestSlide = emblaApi.selectedScrollSnap()
               emblaApi.scrollTo(nearestSlide)
            }
         }, 500)
      }
      const onSettle = () => {
         clearTimeout(timeoutId)
         setScrolling(false)
      }
      if (emblaApi) {
         const onSelect = () => {
            const index = emblaApi.selectedScrollSnap()
            dispatch(swipeToSparkByIndex(index))
            dispatch(removeCurrentEventNotifications())
         }

         emblaApi.on("scroll", onScroll)
         emblaApi.on("settle", onSettle)
         emblaApi.on("select", onSelect)

         // Cleanup: remove the event listener if the component unmounts or sparks changes
         return () => {
            clearTimeout(timeoutId)
            emblaApi.off("select", onSelect)
            emblaApi.off("scroll", onScroll)
            emblaApi.off("settle", onSettle)
         }
      }
   }, [emblaApi, dispatch])

   const handleClickSlide = useCallback(
      (index: number) => {
         dispatch(swipeToSparkByIndex(index))
      },
      [dispatch]
   )

   const handleClickPlayOverlay = useCallback(() => {
      if (videoIsMuted) {
         dispatch(setVideosMuted(false))
         dispatch(setVideoPlaying(true))
      }
   }, [dispatch, videoIsMuted])

   return (
      <Box
         onClick={handleClickPlayOverlay}
         sx={[
            styles.root,
            {
               backgroundColor: isFullScreen ? "black !important" : undefined,
            },
         ]}
      >
         {activeSpark ? (
            <ViewportBox
               sx={[
                  {
                     height: isFullScreen ? undefined : "auto",
                     opacity: isFullScreen && !isOnEdge ? 1 : scrolling ? 0 : 1,
                  },
                  styles.staticViewportVideo,
               ]}
            >
               <Slide fullScreen={isFullScreen}>
                  <FeedCardSlide
                     paused={!isPlaying}
                     playing
                     spark={activeSpark}
                     hideActions
                  />
               </Slide>
            </ViewportBox>
         ) : null}
         <ViewportBox
            outterContent={
               <>
                  <BackToCompanyPageButton />

                  {isFullScreen ? (
                     <Box sx={styles.closeBtn}>
                        <CloseSparksFeedButton dark={emptyFilter} />
                     </Box>
                  ) : null}

                  {userData?.userEmail ? (
                     <SparkNotifications userEmail={userData.userEmail} />
                  ) : null}
               </>
            }
            ref={emblaRef}
         >
            {emptyFilter ? <EmptyFeedSlide fullScreen={isFullScreen} /> : null}
            {sparks.map((spark, index) => {
               // Only render the previous, current, and next sparks for performance
               const shouldRender = Math.abs(currentPlayingIndex - index) <= 1
               const isCurrent = index === currentPlayingIndex

               return (
                  <Slide fullScreen={isFullScreen} key={spark.id + index}>
                     <FeedCardSlide
                        hide={!shouldRender}
                        beThumbnail
                        hideCard={!scrolling && isCurrent}
                        spark={spark}
                        handleClickCard={(e: SyntheticEvent) => {
                           if (isCurrent) {
                              dispatch(togglePlaying())
                           } else {
                              handleClickSlide(index)
                           }
                        }}
                     />
                  </Slide>
               )
            })}
            <Collapse in={isFetchingSparks} unmountOnExit>
               <Slide fullScreen={isFullScreen}>
                  <CircularProgress />
               </Slide>
            </Collapse>
         </ViewportBox>
      </Box>
   )
}

type SlideProps = {
   fullScreen: boolean
} & BoxProps

const Slide: FC<SlideProps> = ({ children, fullScreen, sx, ...props }) => {
   return (
      <Box
         sx={[
            styles.slide,
            fullScreen && styles.fullScreenSlide,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         {...props}
      >
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
      <Box sx={styles.companyPageBtn}>
         <IconButton component={Link} href={cameFromCompanyPageLink}>
            <ArrowBackRoundedIcon color="inherit" />
         </IconButton>
      </Box>
   )
}

type ViewportBoxProps = BoxProps & {
   outterContent?: React.ReactNode
}

const ViewportBox = forwardRef(
   (
      { outterContent, children, sx, ...props }: ViewportBoxProps,
      ref: Ref<any>
   ) => {
      const isFullScreen = useSparksFeedIsFullScreen()
      return (
         <Box
            ref={ref}
            sx={[
               styles.viewport,
               isFullScreen && styles.fullScreenViewport,
               ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
         >
            <Box
               sx={[
                  styles.container,
                  isFullScreen && styles.fullScreenContainer,
               ]}
            >
               {children}
            </Box>
            {outterContent}
         </Box>
      )
   }
)

ViewportBox.displayName = "ViewportBox"

export default SparksFeedCarousel
