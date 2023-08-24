import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import { UserStats } from "@careerfairy/shared-lib/users"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { FC, useCallback, useEffect, useState } from "react"
import SwipeableViews from "react-swipeable-views"
import { autoPlay } from "react-swipeable-views-utils"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import useCountTime from "../../../custom-hook/useCountTime"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import RegistrationModal from "../../common/registration-modal"
import HighlightVideoDialog from "../HighlightVideoDialog"
import BuyCreditsCTAContent from "./BuyCreditsCTAContent"
import {
   CTASlide,
   CTASlideTopics,
   CarouselContent,
} from "./CarouselContentService"
import ContentCarouselPagination from "./ContentCarouselPagination"
import LivestreamContent from "./LivestreamContent"
import WatchSparksCTAContent from "./WatchSparksCTAContent"

const styles = sxStyles({
   wrapper: {
      width: "100%",
      height: { xs: "55vh", md: "40vh" },
      minHeight: "470px",
      position: "relative",
   },
   paginationWrapper: (theme) => ({
      mx: "auto",
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      bottom: {
         xs: theme.spacing(2.5),
         sm: theme.spacing(2.75),
      },
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

   /**
    * Each minute watched the field minutesWatched will be increased, and we need to increment it on our DB
    */
   useEffect(() => {
      const active = content[activeStep]
      const isLivestream = active?.contentType === "LivestreamEvent"
      if (videoUrl && minutesWatched > 0 && isLivestream) {
         void livestreamRepo.updateRecordingStats({
            livestreamId: active.id,
            minutesWatched: 1,
            onlyIncrementMinutes: true,
            userId: userData?.userEmail,
         })
      }
   }, [minutesWatched, userData?.userEmail])

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
      },
      [startCounting, userData?.userEmail]
   )

   const handleCloseVideoDialog = useCallback(() => {
      setVideoUrl(null)
      resetMinutes()
   }, [resetMinutes])

   return (
      <>
         <AutoPlaySwipeableViews
            autoplay={!videoUrl || !joinGroupModalData} // do not auto scroll if video is being played
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            slideStyle={{
               display: "flex",
               alignItems: "flex-end",
            }}
            enableMouseEvents
            interval={CAROUSEL_SLIDE_DELAY}
         >
            {content.map((contentItem, index) => {
               // Check if contentItem is a CTASlide
               if (contentItem.contentType === "CTASlide") {
                  return (
                     <Box sx={styles.wrapper} key={index}>
                        {getCTASlide(contentItem)}
                     </Box>
                  )
               }

               // Default rendering for LivestreamEvent
               return (
                  <Box sx={styles.wrapper} key={contentItem.id}>
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
         {content.length > 1 && (
            <Box sx={styles.paginationWrapper}>
               <ContentCarouselPagination
                  activeStep={activeStep}
                  count={content.length}
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
      </>
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
      default: {
         return null
      }
   }
}

export default ContentCarousel
