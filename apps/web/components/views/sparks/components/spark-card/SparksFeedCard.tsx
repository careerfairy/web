import {
   SparkCardNotificationTypes,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import UnmuteIcon from "@mui/icons-material/VolumeOff"
import { Button, Fade, Grow, Stack } from "@mui/material"
import Box from "@mui/material/Box"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FeedCardActions from "components/views/sparks-feed/FeedCardActions"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { sparkService } from "data/firebase/SparksService"
import {
   FC,
   SyntheticEvent,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { isMobile } from "react-device-detect"
import { useSelector } from "react-redux"
import {
   eventDetailsDialogVisibilitySelector,
   videosMuttedSelector,
} from "store/selectors/sparksFeedSelectors"
import { sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "util/routes"
import FullCardNotification from "./Notifications/FullCardNotification"
import { SparksPopUpNotificationManager } from "./Notifications/SparksPopUpNotificationManager"
import { useLinkedInNotificationStateManagement } from "./Notifications/useLinkedInNotificationStateManagement"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkDetails from "./SparkDetails"
import SparkJobButton from "./SparkJobButton"
import SparkQuestion from "./SparkQuestion"
import VideoPreview from "./VideoPreview"

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
      background:
         "linear-gradient(360deg, rgba(0, 0, 0, 0.30) 0%, rgba(0, 0, 0, 0.00) 105%)",

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
   conversionCardContent: {
      "&::after": {
         background:
            "linear-gradient(357deg, #476E69 31%, #476E69 20%, rgba(311, 380, 0, 0.00) 31.1%), radial-gradient(101.03% 109.86% at 4.52% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.00) 100%), #0F423B",
      },
   },
   creatorLinkedInCardContent: {
      "&::after": {
         background: `
            linear-gradient(178deg, rgba(250, 250, 250, 0.00) 42.22%, rgba(250, 250, 250, 0.20) 42.23%), 
            radial-gradient(150.3% 150.3% at 50% 50%, rgba(0, 0, 0, 0.00) 36.5%, rgba(0, 0, 0, 0.20) 100%), 
            linear-gradient(151deg, rgba(0, 210, 170, 0.00) 34.37%, rgba(0, 210, 170, 0.50) 101.39%), 
            linear-gradient(357deg, rgba(255, 255, 255, 0.00) 10.1%, rgba(255, 255, 255, 0.20) 106.38%), 
            #2ABAA5
         `,
      },
   },
   eventCardContentInner: {
      height: "100%",
      mt: "unset",
      justifyContent: "center",
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
   jobButton: {
      mt: { md: 1.5 },
      mb: { xs: 2, md: "unset" },
      mx: { xs: 1, md: "unset" },
   },
   desktopContentInner: {
      justifyContent: "flex-end",
      width: "100%",
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

   const { trackEvent, trackSecondsWatched } = useSparksFeedTracker()

   const { onSparkPercentagePlayed } = useLinkedInNotificationStateManagement()

   const companyPageLink = spark.group.publicProfile
      ? `/company/${companyNameSlugify(spark.group.universityName)}`
      : undefined

   const mentorPageLink = buildMentorPageLink({
      universityName: spark.group.universityName,
      firstName: spark.creator.firstName,
      lastName: spark.creator.lastName,
      creatorId: spark.creator.id,
   })

   const onCreatorDetailsClick = useCallback(() => {
      if (mentorPageLink) {
         trackEvent(SparkEventActions.Click_MentorPageCTA)
      }
   }, [mentorPageLink, trackEvent])

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

   const cardNotificationStyle = () => {
      switch (spark.cardNotificationType) {
         case SparkCardNotificationTypes.EVENT:
            return [styles.eventCardContent]

         case SparkCardNotificationTypes.GROUP:
            return [styles.defaultCardContent]

         case SparkCardNotificationTypes.CONVERSION:
            return [styles.conversionCardContent]

         case SparkCardNotificationTypes.CREATOR:
            return [styles.creatorLinkedInCardContent]
      }
   }
   return (
      <>
         <Box sx={[styles.root, isFullScreen && styles.fullScreenRoot]}>
            {isOverlayedOntop ? (
               <Box key={identifier}>
                  <SparksPopUpNotificationManager spark={spark} />
               </Box>
            ) : null}

            <Box
               sx={[
                  styles.cardContent,
                  ...(showCardNotification ? cardNotificationStyle() : []),
               ]}
               onClick={(event: SyntheticEvent) => {
                  if (event.target === event.currentTarget) {
                     handleClickCard(event)
                  }
               }}
            >
               {videosMuted &&
               isOverlayedOntop &&
               !spark?.isCardNotification ? (
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
                     onPercentagePlayed={onSparkPercentagePlayed}
                     light={isOverlayedOntop}
                     containPreviewOnTablet
                     identifier={identifier}
                  />
               )}
               <Box
                  sx={[
                     styles.contentInner,
                     showCardNotification && styles.eventCardContentInner,
                  ]}
               >
                  {showCardNotification ? (
                     <FullCardNotification spark={spark} />
                  ) : isOverlayedOntop ? (
                     <Stack
                        sx={styles.desktopContentInner}
                        onClick={(e: SyntheticEvent) => {
                           if (e.target === e.currentTarget) {
                              handleClickCard(e)
                           }
                        }}
                     >
                        <SparkDetails
                           companyLogoUrl={getResizedUrl(
                              spark.creator.avatarUrl,
                              "md"
                           )}
                           onClick={onCreatorDetailsClick}
                           displayName={`${spark.creator.firstName} ${spark.creator.lastName}`}
                           companyName={spark.group.universityName}
                           creatorPosition={spark.creator.position}
                           linkToMentorPage={mentorPageLink}
                        />
                        <Box mt={2} />
                        <SparkCategoryChip categoryId={spark.category.id} />
                        <Box mt={1.5} />
                        <SparkQuestion question={spark.question} />
                        {spark.hasJobs && !isMobile ? (
                           <JobButton spark={spark} />
                        ) : null}
                     </Stack>
                  ) : null}
                  {!showCardNotification && isFullScreen ? (
                     <>
                        <Box ml="auto" />
                        <FeedCardActions
                           hide={!isOverlayedOntop}
                           spark={spark}
                           linkToCompanyPage={companyPageLink}
                           shareUtmMedium="sparks-referrals"
                        />
                     </>
                  ) : null}
               </Box>
               {spark.hasJobs && isMobile ? <JobButton spark={spark} /> : null}
            </Box>
         </Box>
         {!showCardNotification && !isFullScreen ? (
            <Box sx={styles.outerActionsWrapper}>
               <FeedCardActions
                  hide={!isOverlayedOntop}
                  spark={spark}
                  linkToCompanyPage={companyPageLink}
                  shareUtmMedium="sparks-referrals"
               />
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

type JobButtonProps = {
   spark: SparkPresenter
}

const JobButton = ({ spark }: JobButtonProps) => (
   <Box sx={styles.jobButton}>
      <SuspenseWithBoundary fallback={<></>}>
         <SparkJobButton spark={spark} />
      </SuspenseWithBoundary>
   </Box>
)
