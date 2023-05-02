import { Box, Container } from "@mui/material"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../types/commonTypes"
import Image from "next/image"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import React, { FC, useCallback, useEffect, useState } from "react"
import { autoPlay } from "react-swipeable-views-utils"
import SwipeableViews from "react-swipeable-views"
import { darken, useTheme } from "@mui/material/styles"
import HighlightVideoDialog from "../HighlightVideoDialog"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import ContentCarouselPagination from "./ContentCarouselPagination"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useCountTime from "../../../custom-hook/useCountTime"
import useContent, { UseContent } from "./useContent"
import RegistrationModal from "../../common/registration-modal"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import LivestreamContent from "./LivestreamContent"
import { ContentSkeleton } from "./Content"

const styles = sxStyles({
   wrapper: {
      width: "100%",
      height: { xs: "50vh", md: "40vh" },
      minHeight: "450px",
   },
   image: {
      "&:after": {
         position: "absolute",
         height: "100%",
         width: "100%",
         content: '" "',
         backgroundColor: (theme) => darken(theme.palette.navyBlue.main, 0.5),
         opacity: 0.7,
      },
   },
   content: {
      position: "relative",
      paddingX: { xs: 4, md: 2 },
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
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

const ContentCarousel: FC<UseContent> = (props) => {
   const theme = useTheme()
   const { userData } = useAuth()
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

   const { content, loadingContent } = useContent(props)

   /**
    * Each minute watched the field minutesWatched will be increased, and we need to increment it on our DB
    */
   useEffect(() => {
      if (videoUrl && minutesWatched > 0) {
         void livestreamRepo.updateRecordingStats({
            livestreamId: content[activeStep].id,
            minutesWatched: 1,
            onlyIncrementMinutes: true,
         })
      }
   }, [minutesWatched])

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

   if (loadingContent) {
      return <ContentCarouselSkeleton />
   }

   return (
      <>
         <AutoPlaySwipeableViews
            autoplay={!videoUrl || !!joinGroupModalData} // do not auto scroll if video is being played
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
            {content.map((contentItem) => (
               <Box sx={styles.wrapper} key={contentItem.id}>
                  <Box
                     sx={[styles.wrapper, styles.image]}
                     position={"absolute"}
                  >
                     <Image
                        src={getResizedUrl(
                           contentItem.backgroundImageUrl,
                           "lg"
                        )}
                        alt={contentItem.title}
                        layout="fill"
                        objectFit="cover"
                        quality={90}
                     />
                  </Box>
                  <Container disableGutters sx={styles.content}>
                     <LivestreamContent
                        handleBannerPlayRecording={handleBannerPlayRecording}
                        livestreamData={contentItem}
                        handleClickRegister={handleClickRegister}
                     />
                  </Container>
               </Box>
            ))}
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

const ContentCarouselSkeleton: FC = () => {
   return (
      <Box sx={styles.wrapper}>
         <Box sx={[styles.wrapper, styles.image]} position={"absolute"} />
         <Container disableGutters sx={styles.content}>
            <ContentSkeleton />
         </Container>
      </Box>
   )
}

export default ContentCarousel
