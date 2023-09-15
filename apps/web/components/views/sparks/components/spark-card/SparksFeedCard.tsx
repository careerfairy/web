import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import { Stack } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import FeedCardActions from "components/views/sparks-feed/FeedCardActions"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { FC, useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkDetails from "./SparkDetails"
import SparkQuestion from "./SparkQuestion"
import VideoPreview from "./VideoPreview"
import SparksEventNotification from "./SparksEventNotification"
import { useSelector } from "react-redux"
import { eventDetailsDialogVisibilitySelector } from "store/selectors/sparksFeedSelectors"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"
import SparkEventFullCardNotification from "./SparkEventFullCardNotification"
import useLivestream from "../../../../custom-hook/live-stream/useLivestream"

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
      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         // Provides a gradient overlay at the top and bottom of the card to make the text more readable.
         background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0) 82.29%, rgba(0, 0, 0, 0.60) 100%)`,
         zIndex: -1,
      },
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      flex: 1,
      position: "relative",
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
   eventCardContentInner: {
      height: "100%",
      mt: "unset",
   },
   cardDetails: {
      cursor: "pointer",
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
   const isFullScreen = useSparksFeedIsFullScreen()
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )

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

   // TODO: logic to get the event needs to be adjusted
   //  is require to set the currentEventNotification on the redux
   //  then we can read it here, get the eventId and use this hook to get the event
   const { data: event } = useLivestream("XWxe4sNU7kGlM2xkt6Mh")

   return (
      <>
         <Box sx={[styles.root, isFullScreen && styles.fullScreenRoot]}>
            <SparksEventNotification spark={spark} />
            <VideoPreview
               thumbnailUrl={getResizedUrl(spark.video.thumbnailUrl, "lg")}
               videoUrl={spark.getTransformedVideoUrl()}
               playing={playing}
               onSecondPassed={trackSecondsWatched}
               pausing={eventDetailsDialogVisibility}
               onVideoPlay={onVideoPlay}
               onVideoEnded={onVideoEnded}
            />
            <Box
                sx={[
                    styles.cardContent,
                    ...(event ? [styles.eventCardContent] : []),
                ]}
            >
               <Box
                   sx={[
                       styles.contentInner,
                       ...(event ? [styles.eventCardContentInner] : []),
                   ]}
               >
                   {
                       event ? (
                           <SparkEventFullCardNotification event={event} />
                       ) : (
                           <Stack sx={styles.cardDetails} flexGrow={1}>
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
                       )
                   }
                   {isFullScreen || event ? null : (
                       <Box sx={styles.outerActionsWrapper}>
                           <FeedCardActions spark={spark} />
                       </Box>
                   )}
               </Box>
            </Box>
         </Box>
         {isFullScreen ? null : (
            <Box sx={styles.outerActionsWrapper}>
               <FeedCardActions spark={spark} />
            </Box>
         )}
      </>
   )
}

export default SparksFeedCard
