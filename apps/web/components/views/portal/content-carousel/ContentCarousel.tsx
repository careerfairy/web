import {
   europeCountryFilters,
   userIsTargetedApp,
} from "@careerfairy/shared-lib/countries/filters"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import { UserStats } from "@careerfairy/shared-lib/users"
import {
   Box
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useIsMobile from "components/custom-hook/useIsMobile"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import { isLivestreamDialogOpen } from "components/views/livestream-dialog"
import { useRouter } from "next/router"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import SwipeableViews from "react-swipeable-views"
import { autoPlay } from "react-swipeable-views-utils"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import { MobileUtils } from "../../../../util/mobile.utils"
import useCountTime from "../../../custom-hook/useCountTime"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import { useIsMounted } from "../../../custom-hook/utils/useIsMounted"
import RegistrationModal from "../../common/registration-modal"
import HighlightVideoDialog from "../HighlightVideoDialog"
import BuyCreditsCTAContent from "./BuyCreditsCTAContent"
import {
   CTASlide,
   CTASlideTopics,
   CarouselContent,
} from "./CarouselContentService"
import ContentCarouselPagination from "./ContentCarouselPagination"
import { DiscoverJobsCTAContent } from "./DiscoverJobsCTAContent"
import { DownloadMobileApplication } from "./DownloadMobileApplicationContent"
import LivestreamContent from "./LivestreamContent"
import WatchSparksCTAContent from "./WatchSparksCTAContent"

const styles = sxStyles({
   root: {
      position: "relative",
      mb: 3,
      mx: 0,
      mt: 2,
   },
   slide: {
      display: "flex",
      alignItems: "flex-end",
      width: "100%",
      paddingRight: "16px",
      paddingLeft: "16px",
      margin: 0,
      overflow: "visible",
   },
   slideMobile: {
      paddingRight: "8px",
      paddingLeft: "8px",
   },
   contentWrapper: {
      background: "white",
      width: "100%",
      height: { xs: "368px", md: "384px" },
      position: "relative",
      borderRadius: "12px",
   },
   paginationWrapper: (theme) => ({
      mx: "auto",
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      bottom: theme.spacing(1.5),
      left: "50%",
      transform: "translateX(-50%)",
   }),
})

const CAROUSEL_SLIDE_DELAY = 10000
const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

type Props = {
   content: CarouselContent[]
   serverUserStats: UserStats
}

const ContentCarousel: FC<Props> = ({ content, serverUserStats }) => {
   const theme = useTheme()
   const { userData, userStats } = useAuth()
   const { userCountryCode } = useUserCountryCode()
   const isMobile = useIsMobile()
   const [activeStep, setActiveStep] = useState(0)
   const [videoUrl, setVideoUrl] = useState(null)
   const {
      timeWatched: minutesWatched,
      startCounting,
      pauseCounting,
      resetMinutes,
   } = useCountTime()

   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal()
   const { query } = useRouter()
   const isMounted = useIsMounted()

   const isLSDialogOpen = isLivestreamDialogOpen(query)

   const carouselContent = useMemo<CarouselContent[]>(() => {
      let serializedContent = content

      if (
         isMounted &&
         !MobileUtils.webViewPresence() &&
         (userData
            ? userIsTargetedApp(userData)
            : europeCountryFilters.includes(userCountryCode)) // check IP if not logged in
      ) {
         serializedContent = [
            {
               contentType: "CTASlide",
               topic: CTASlideTopics.App,
            },
            ...serializedContent,
         ]
      }

      return serializedContent
   }, [content, isMounted, userData, userCountryCode])

   /**
    * Each minute watched the field minutesWatched will be increased, and we need to increment it on our DB
    */
   useEffect(() => {
      const active = carouselContent[activeStep]
      const isLivestream = active?.contentType === "LivestreamEvent"
      if (videoUrl && minutesWatched > 0 && isLivestream) {
         void livestreamRepo.updateRecordingStats({
            livestreamId: active.id,
            minutesWatched: 1,
            onlyIncrementMinutes: true,
            userId: userData?.userEmail,
         })
      }
   }, [
      activeStep,
      carouselContent,
      minutesWatched,
      userData?.userEmail,
      videoUrl,
   ])

   const handleStepChange = useCallback(
      (step) => {
         if (step != activeStep) {
            setActiveStep(step)
         }
      },
      [activeStep]
   )

   /**
    * when clicking on play recording:
    *  - get the recording token to be able to show the video
    *  - update recording stats with 1 more view and amd add the userId to the viewers field
    */
   const handleBannerPlayRecording = useCallback(
      async (livestream: LivestreamEvent) => {
         const recordingToken =
            await livestreamRepo.getLivestreamRecordingTokenAndIncrementViewStat(
               livestream.id,
               livestream.start,
               userData?.userEmail
            )

         setVideoUrl(
            downloadLinkWithDate(
               livestream.start.toDate(),
               livestream.id,
               recordingToken?.sid
            )
         )
         startCounting()
         dataLayerLivestreamEvent(AnalyticsEvents.RecordingPlay, livestream)
      },
      [startCounting, userData?.userEmail]
   )

   const handleCloseVideoDialog = useCallback(() => {
      setVideoUrl(null)
      resetMinutes()
   }, [resetMinutes])

   const slideStyles = isMobile
      ? { ...styles.slide, ...styles.slideMobile }
      : styles.slide

   return (
      <Box sx={styles.root}>
         <AutoPlaySwipeableViews
            autoplay={!(videoUrl || isLSDialogOpen)} // do not auto scroll if dialog is open
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            slideStyle={slideStyles}
            enableMouseEvents
            interval={CAROUSEL_SLIDE_DELAY}
            style={{ overflow: "visible" }}
         >
            {carouselContent.map((contentItem, index) => {
               // Check if contentItem is a CTASlide
               if (contentItem.contentType === "CTASlide") {
                  return (
                     <Box sx={styles.contentWrapper} key={index}>
                        {getCTASlide(contentItem)}
                     </Box>
                  )
               }

               // Default rendering for LivestreamEvent
               return (
                  <Box sx={styles.contentWrapper} key={contentItem.id}>
                     <LivestreamContent
                        handleBannerPlayRecording={handleBannerPlayRecording}
                        livestreamData={contentItem}
                        handleClickRegister={handleClickRegister}
                        userStats={userStats || serverUserStats}
                     />
                  </Box>
               )
            })}
         </AutoPlaySwipeableViews>
         {carouselContent.length > 1 && (
            <Box sx={styles.paginationWrapper}>
               <ContentCarouselPagination
                  activeStep={activeStep}
                  count={carouselContent.length}
                  handleChange={handleStepChange}
                  delay={CAROUSEL_SLIDE_DELAY}
               />
            </Box>
         )}
         {videoUrl ? (
            <HighlightVideoDialog
               videoUrl={videoUrl}
               handleClose={handleCloseVideoDialog}
               handlePauseVideo={pauseCounting}
               handlePlayVideo={startCounting}
            />
         ) : null}
         {joinGroupModalData ? (
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               handleClose={handleCloseJoinModal}
            />
         ) : null}
      </Box>
   )
}

const getCTASlide = (contentItem: CTASlide) => {
   switch (contentItem.topic) {
      case CTASlideTopics.CareerCoins: {
         return <BuyCreditsCTAContent cta={contentItem} />
      }
      case CTASlideTopics.Sparks: {
         return <WatchSparksCTAContent cta={contentItem} />
      }
      case CTASlideTopics.Jobs: {
         return <DiscoverJobsCTAContent cta={contentItem} />
      }
      case CTASlideTopics.App: {
         return <DownloadMobileApplication cta={contentItem} />
      }
      default: {
         return null
      }
   }
}

export default ContentCarousel
