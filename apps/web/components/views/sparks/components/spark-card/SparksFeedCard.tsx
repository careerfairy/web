import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import { Stack } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FeedCardActions from "components/views/sparks-feed/FeedCardActions"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { FC, useCallback, useMemo } from "react"
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
} from "store/selectors/sparksFeedSelectors"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"
import SparkEventFullCardNotification from "./Notifications/SparkEventFullCardNotification"
import SparkGroupFullCardNotification from "./Notifications/SparkGroupFullCardNotification"
import { useInView } from "react-intersection-observer"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import { sparkService } from "data/firebase/SparksService"
import { useAuth } from "HOCs/AuthProvider"

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
      mt: "auto",
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
})

type Props = {
   spark: SparkPresenter
   playing: boolean
}

const SparksFeedCard: FC<Props> = ({ spark, playing }) => {
   const { data: visitorId } = useFingerPrint()
   const { authenticatedUser } = useAuth()

   const isFullScreen = useSparksFeedIsFullScreen()
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )
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

   const { ref } = useInView({
      threshold: 0.9, // At least 90% of the element must be visible
      delay: 1000, // Element must be at least visible for 1 second before triggering
      skip: !visitorId,
      onChange: (inView) => {
         if (inView) {
            sparkService
               .markSparkAsSeen(authenticatedUser?.email, spark.id)
               .catch(console.error)
            trackEvent(SparkEventActions.Impression)
         }
      },
   })

   const showCardNotification = useMemo(
      () => Boolean(spark.isCardNotification),
      [spark.isCardNotification]
   )

   return (
      <>
         <Box
            ref={ref}
            sx={[styles.root, isFullScreen && styles.fullScreenRoot]}
         >
            <SparksEventNotification spark={spark} />

            {showCardNotification ? null : (
               <VideoPreview
                  thumbnailUrl={getResizedUrl(spark.video.thumbnailUrl, "lg")}
                  videoUrl={spark.getTransformedVideoUrl()}
                  playing={playing}
                  onSecondPassed={trackSecondsWatched}
                  pausing={eventDetailsDialogVisibility}
                  onVideoPlay={onVideoPlay}
                  onVideoEnded={onVideoEnded}
               />
            )}

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
                  ) : (
                     <Stack flexGrow={1}>
                        <Box mt="auto" />
                        <SparkDetails
                           companyLogoUrl={getResizedUrl(
                              spark.group.logoUrl,
                              "md"
                           )}
                           onClick={onSparkDetailsClick}
                           displayName={`${spark.creator.firstName} ${spark.creator.lastName}`}
                           companyName={spark.group.universityName}
                           linkToCompanyPage={companyPageLink}
                        />
                        <Box mt={2.5} />
                        <SparkCategoryChip categoryId={spark.category.id} />
                        <Box mt={1.5} />
                        <SparkQuestion question={spark.question} />
                     </Stack>
                  )}
                  {!showCardNotification && isFullScreen ? (
                     <FeedCardActions spark={spark} />
                  ) : null}
               </Box>
            </Box>
         </Box>
         {!showCardNotification && !isFullScreen ? (
            <Box sx={styles.outerActionsWrapper}>
               <FeedCardActions spark={spark} />
            </Box>
         ) : null}
      </>
   )
}

export default SparksFeedCard
