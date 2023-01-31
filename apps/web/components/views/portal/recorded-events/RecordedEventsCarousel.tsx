import { Box, Container, IconButton, Typography } from "@mui/material"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { StylesProps } from "../../../../types/commonTypes"
import Image from "next/image"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import PlayIcon from "@mui/icons-material/PlayArrowRounded"
import React, { useCallback, useEffect, useState } from "react"
import { autoPlay } from "react-swipeable-views-utils"
import SwipeableViews from "react-swipeable-views"
import { darken, useTheme } from "@mui/material/styles"
import HighlightVideoDialog from "../HighlightVideoDialog"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import RecordedEventsCarouselPagination from "./RecordedEventsCarouselPagination"
import DateUtil from "../../../../util/DateUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useCountTime from "../../../custom-hook/useCountTime"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"

type Props = {
   livestreams: LivestreamEvent[]
}

const styles: StylesProps = {
   wrapper: {
      width: "100%",
      height: { xs: "50vh", md: "40vh" },
      minHeight: "400px",
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
   },
   info: {
      marginTop: 4,
      display: "flex",
      flexDirection: "column",
   },
   watchButton: {
      paddingLeft: 0,

      "&:hover": {
         "& svg": {
            border: (theme) => `5px solid ${theme.palette.primary.main}`,
         },
      },
   },
   icon: {
      width: "60px",
      height: "60px",
      left: "999px",
      top: "475px",
      background: "rgba(33, 32, 32, 0.6)",
      border: "4px solid white",
      borderRadius: "50%",

      "&:hover": {
         border: (theme) => `5px solid ${theme.palette.primary.main}`,
      },
   },
   paginationWrapper: {
      position: "fixed",
      bottom: "40px",
      width: "max-content",
   },
   stepper: {
      width: "35px",
      height: "5px",
      marginRight: "20px",
      borderRadius: "30px",
      backgroundColor: "#9999B1",
      cursor: "pointer",
   },
   activeStepper: {
      cursor: "unset",
   },
}

const CAROUSEL_SLIDE_DELAY = 10000

const RecordedEventsCarousel = ({ livestreams }: Props) => {
   const theme = useTheme()
   const { userData } = useAuth()
   const AutoPlaySwipeableViews = autoPlay(SwipeableViews)
   const [activeStep, setActiveStep] = useState(0)
   const [videoUrl, setVideoUrl] = useState(null)
   const {
      timeWatched: minutesWatched,
      startCounting,
      pauseCounting,
      resetMinutes,
   } = useCountTime()

   /**
    * Each minute watched the field minutesWatched will be increased, and we need to increment it on our DB
    */
   useEffect(() => {
      if (videoUrl && minutesWatched > 0) {
         void livestreamRepo.updateRecordingStats({
            livestreamId: livestreams[activeStep].id,
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

   const renderRemainingTimeText = useCallback(
      (livestream: LivestreamEvent) => {
         const timeLeft = DateUtil.calculateTimeLeft(
            LivestreamPresenter.createFromDocument(
               livestream
            ).recordingAccessTimeLeft()
         )

         return timeLeft?.Days === 0
            ? "Last day to rewatch"
            : `${timeLeft.Days} days left to rewatch`
      },
      []
   )

   return (
      <>
         <AutoPlaySwipeableViews
            autoplay={!videoUrl} // do not auto scroll if video is being played
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
            {livestreams.map((livestream) => (
               <Box sx={styles.wrapper} key={livestream.id}>
                  <Box
                     sx={[styles.wrapper, styles.image]}
                     position={"absolute"}
                  >
                     <Image
                        src={getResizedUrl(livestream.backgroundImageUrl, "lg")}
                        alt={livestream.title}
                        layout="fill"
                        objectFit="cover"
                        quality={90}
                     />
                  </Box>
                  <Container disableGutters sx={styles.content}>
                     <Box sx={styles.info}>
                        <Box mt={4}>
                           <Typography
                              variant={"h2"}
                              fontWeight="bold"
                              component="h1"
                              color={"white"}
                           >
                              Watch again
                           </Typography>
                           <Typography
                              variant={"h4"}
                              fontWeight="bold"
                              component="h2"
                              color={"white"}
                              mt={2}
                              maxWidth={{ xs: "100%", md: "60%" }}
                           >
                              {livestream.title}
                           </Typography>
                           <Typography
                              variant={"h6"}
                              component="h2"
                              fontWeight={"400"}
                              color={"white"}
                              mt={1}
                           >
                              {renderRemainingTimeText(livestream)}
                           </Typography>
                        </Box>
                        <Box mt={4}>
                           <IconButton
                              onClick={() =>
                                 handleBannerPlayRecording(livestream)
                              }
                              color={"info"}
                              sx={styles.watchButton}
                              disableRipple={true}
                           >
                              <Typography
                                 variant={"h5"}
                                 component="h2"
                                 fontWeight={"bold"}
                                 color={"white"}
                                 mr={2}
                              >
                                 WATCH RECORDING
                              </Typography>
                              <PlayIcon sx={styles.icon} />
                           </IconButton>
                        </Box>
                     </Box>
                     {livestreams.length > 1 && (
                        <Box sx={styles.paginationWrapper}>
                           <RecordedEventsCarouselPagination
                              activeStep={activeStep}
                              count={livestreams.length}
                              handleChange={handleStepChange}
                              delay={CAROUSEL_SLIDE_DELAY}
                           />
                        </Box>
                     )}
                  </Container>
               </Box>
            ))}
         </AutoPlaySwipeableViews>

         {videoUrl ? (
            <HighlightVideoDialog
               videoUrl={videoUrl}
               handleClose={handleCloseVideoDialog}
               handlePauseVideo={pauseCounting}
               handlePlayVideo={startCounting}
            />
         ) : null}
      </>
   )
}

export default RecordedEventsCarousel
