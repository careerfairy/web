import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import { Button, Fade, Grow, Stack } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FeedCardActions from "components/views/sparks-feed/FeedCardActions"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import {
   FC,
   SyntheticEvent,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkDetails from "./SparkDetails"
import SparkQuestion from "./SparkQuestion"
import VideoPreview from "./VideoPreview"
import SparksEventNotification from "./Notifications/SparksEventNotification"
import { useSelector } from "react-redux"
import {
   cardNotificationSelector,
   eventDetailsDialogVisibilitySelector,
   videosMuttedSelector,
} from "store/selectors/sparksFeedSelectors"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"
import SparkEventFullCardNotification from "./Notifications/SparkEventFullCardNotification"
import SparkGroupFullCardNotification from "./Notifications/SparkGroupFullCardNotification"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import { sparkService } from "data/firebase/SparksService"
import { useAuth } from "HOCs/AuthProvider"
import UnmuteIcon from "@mui/icons-material/VolumeOff"

const styles = sxStyles({
   root: {
      borderRadius: 3.25,
      width: "100%",
      height: "100%",
      color: "white",
      display: "flex",
      objectFit: "cover",
      position: "relative",
      flexDirection: "column",
      overflow: "hidden",
   },
   fullScreenRoot: {
      borderRadius: 0,
   },
   cardContent: {
      zIndex: 1,
      display: "flex",
      flex: 1,
      flexDirection: "column",
      position: "relative",
      justifyContent: "flex-end",

      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         zIndex: -1,
      },
   },
   contentInner: {
      display: "flex",
      justifyContent: "space-between",
      zIndex: 1,
      p: 2.5,
      px: {
         xs: 1.5,
         sparksFullscreen: 2.5,
      },
      pb: {
         xs: 3.25,
         sparksFullscreen: 4,
      },
   },
   eventCardContent: {
      "&::after": {
         background:
            "linear-gradient(175deg,rgb(255 255 255 / 0%) 55%, rgb(255 255 255 / 13%) 45%), radial-gradient(167.78% 167.78% at 95.7% 3.63%, rgb(15 224 184 / 90%) 8.85%, rgb(103 73 234 / 70%) 100%), linear-gradient(237deg, rgb(42, 186, 165), rgb(42, 186, 165)), linear-gradient(203deg, rgb(247 248 252), rgb(247 248 252))",
      },
   },
   defaultCardContent: {
      "&::after": {
         background:
            "linear-gradient(6deg,rgb(255 255 255 / 0%) 88%, rgb(255 255 255 / 13%) 8%),linear-gradient(185deg,rgb(255 255 255 / 0%) 88%, rgb(255 255 255 / 13%) 8%), linear-gradient(0deg, rgba(247, 248, 252, 0.20) 0%, rgba(247, 248, 252, 0.20) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 42.19%, rgba(0, 0, 0, 0.06) 88.02%), linear-gradient(180deg, rgba(103, 73, 234, 0.30) 0%, rgba(80, 56, 185, 0.30) 100%), radial-gradient(180.08% 206.61% at 95.7% 3.63%, rgba(103, 73, 234, 0.90) 0%, rgba(0, 210, 170, 0.90) 100%), #2ABAA6",
      },
   },
   eventCardContentInner: {
      height: "100%",
      mt: "unset",
   },
   outerActionsWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      transform: "translate(100%, 0)",
      pl: 2.9375,
      pb: 4,
   },
   clickToPlayOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: (theme) => theme.zIndex.drawer + 12342423,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
   },
   overlayButtonWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      p: 2,
   },
   hideOverlay: {
      background: "transparent",
   },
})

type Props = {
   spark: SparkPresenter
   /**
    * Whether the video is playing or not,
    * if it goes from true to false,
    * the video will be reset to the beginning
    */
   playing: boolean
   /**
    * Whether the video is paused or not
    */
   paused?: boolean
   isOverlayedOntop?: boolean
   hideVideo?: boolean
   handleClickCard?: (e: SyntheticEvent) => void
   identifier?: string
}

const SparksFeedCard: FC<Props> = ({
   spark,
   playing,
   paused,
   isOverlayedOntop,
   hideVideo,
   handleClickCard,
   identifier,
}) => {
   const { data: visitorId } = useFingerPrint()
   const { authenticatedUser } = useAuth()

   const isFullScreen = useSparksFeedIsFullScreen()

   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )
   const videosMuted = useSelector(videosMuttedSelector)
   const cardNotification = useSelector(cardNotificationSelector)

   const { trackEvent, trackSecondsWatched } = useSparksFeedTracker()

   const companyPageLink = spark.group.publicProfile
      ? `/company/${companyNameSlugify(spark.group.universityName)}`
      : undefined

   const onSparkDetailsClick = useCallback(() => {
      if (companyPageLink) {
         trackEvent(SparkEventActions.Click_CompanyPageCTA)
      }
   }, [companyPageLink, trackEvent])

   const onVideoPlay = useCallback(() => {
      trackEvent(SparkEventActions.Played_Spark)
   }, [trackEvent])

   const onVideoEnded = useCallback(() => {
      trackEvent(SparkEventActions.Watched_CompleteSpark)
   }, [trackEvent])

   const trackEventRef = useRef(trackEvent)

   useEffect(() => {
      if (!visitorId || !isOverlayedOntop) return

      if (identifier) {
         // Identifier has changed, perform necessary actions
         const timeoutId = setTimeout(() => {
            // At least 1 second has passed, trigger the impression and mark the spark as seen
            sparkService
               .markSparkAsSeen(authenticatedUser?.email, spark.id)
               .catch(console.error)
            trackEventRef.current(SparkEventActions.Impression)
         }, 1000) // Delay of 1 second

         // Cleanup function to clear the timeout if the component unmounts before the timeout finishes
         return () => clearTimeout(timeoutId)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [identifier, visitorId, isOverlayedOntop])

   const showCardNotification = useMemo(
      () => Boolean(spark.isCardNotification),
      [spark.isCardNotification]
   )

   if (!visitorId) return null

   return (
      <>
         <Box
            onClick={handleClickCard}
            sx={[styles.root, isFullScreen && styles.fullScreenRoot]}
         >
            {isOverlayedOntop ? (
               <SparksEventNotification spark={spark} />
            ) : null}

            <Box
               sx={[
                  styles.cardContent,
                  ...(showCardNotification
                     ? cardNotification
                        ? [styles.eventCardContent]
                        : [styles.defaultCardContent]
                     : []),
               ]}
            >
               {videosMuted && isOverlayedOntop ? (
                  <ClickToUnmuteOverlay />
               ) : null}
               {showCardNotification || hideVideo ? null : (
                  <VideoPreview
                     muted={videosMuted}
                     thumbnailUrl={getResizedUrl(
                        spark.video.thumbnailUrl,
                        "lg"
                     )}
                     videoUrl={spark.getTransformedVideoUrl()}
                     playing={playing}
                     onSecondPassed={trackSecondsWatched}
                     pausing={eventDetailsDialogVisibility || paused}
                     onVideoPlay={onVideoPlay}
                     onVideoEnded={onVideoEnded}
                     light={isOverlayedOntop}
                     containPreviewOnTablet
                     identifier={identifier}
                  />
               )}
               <Box
                  sx={[
                     styles.contentInner,
                     ...(showCardNotification
                        ? [styles.eventCardContentInner]
                        : []),
                  ]}
               >
                  {showCardNotification ? (
                     <>
                        {cardNotification ? (
                           <SparkEventFullCardNotification
                              eventId={cardNotification.eventId}
                           />
                        ) : (
                           <SparkGroupFullCardNotification
                              group={spark.group}
                           />
                        )}
                     </>
                  ) : isOverlayedOntop ? (
                     <Stack justifyContent="flex-end">
                        <SparkDetails
                           companyLogoUrl={getResizedUrl(
                              spark.group.logoUrl,
                              "md"
                           )}
                           onClick={onSparkDetailsClick}
                           displayName={`${spark.creator.firstName} ${spark.creator.lastName}`}
                           companyName={spark.group.universityName}
                           creatorPosition={spark.creator.position}
                           linkToCompanyPage={companyPageLink}
                        />
                        <Box mt={2} />
                        <SparkCategoryChip categoryId={spark.category.id} />
                        <Box mt={1.5} />
                        <SparkQuestion question={spark.question} />
                     </Stack>
                  ) : null}
                  {!showCardNotification && isFullScreen ? (
                     <>
                        <Box ml="auto" />
                        <FeedCardActions
                           hide={!isOverlayedOntop}
                           spark={spark}
                        />
                     </>
                  ) : null}
               </Box>
            </Box>
         </Box>
         {!showCardNotification && !isFullScreen ? (
            <Box sx={styles.outerActionsWrapper}>
               <FeedCardActions hide={!isOverlayedOntop} spark={spark} />
            </Box>
         ) : null}
      </>
   )
}

export const ClickToUnmuteOverlay = () => {
   const [hideOverlay, setHideOverlay] = useState(false)

   useEffect(() => {
      const timer = setTimeout(() => {
         setHideOverlay(false)
      }, 5000)
      return () => {
         clearTimeout(timer)
      }
   }, [])

   return (
      <Fade in>
         <Box
            sx={[styles.clickToPlayOverlay, hideOverlay && styles.hideOverlay]}
         >
            <Box sx={styles.overlayButtonWrapper}>
               <Grow in={!hideOverlay}>
                  <span>
                     <Button
                        variant="contained"
                        color="info"
                        startIcon={<UnmuteIcon />}
                     >
                        Tap to unmute
                     </Button>
                  </span>
               </Grow>
            </Box>
         </Box>
      </Fade>
   )
}

export default SparksFeedCard
