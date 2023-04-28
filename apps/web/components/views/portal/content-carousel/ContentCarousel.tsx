import { Box, ButtonProps, Container, Typography } from "@mui/material"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../types/commonTypes"
import Image from "next/image"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import React, {
   FC,
   ReactNode,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { autoPlay } from "react-swipeable-views-utils"
import SwipeableViews from "react-swipeable-views"
import { darken, useTheme } from "@mui/material/styles"
import HighlightVideoDialog from "../HighlightVideoDialog"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import ContentCarouselPagination from "./ContentCarouselPagination"
import DateUtil from "../../../../util/DateUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useCountTime from "../../../custom-hook/useCountTime"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import Button from "@mui/material/Button"
import PlayIcon from "@mui/icons-material/PlayCircleOutline"
import Stack from "@mui/material/Stack"
import useContent, { Content, UseContent } from "./useContent"
import useRecordingAccess from "../../upcoming-livestream/HeroSection/useRecordingAccess"
import RegistrationModal from "../../common/registration-modal"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import Link from "../../common/Link"
import useLivestreamHosts from "../../../custom-hook/live-stream/useLivestreamHosts"
import useTraceUpdate from "../../../custom-hook/utils/useTraceUpdate"

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
   paginationWrapper: (theme) => ({
      mx: "auto",
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      bottom: {
         xs: theme.spacing(3.5),
         sm: theme.spacing(2.75),
      },
      left: "50%",
      transform: "translateX(-50%)",
   }),
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
   icon: {},
   blackText: {
      color: "text.primary",
   },
   button: {
      textTransform: "none",
      py: 0.9,
   },
   logoWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 88,
      height: 48,
      p: [1, 1.5],
      backgroundColor: "white",
      borderRadius: 1.5,
   },
})

const CAROUSEL_SLIDE_DELAY = 10000

const ContentCarousel: FC<UseContent> = (props) => {
   useTraceUpdate(props)
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

   return (
      <>
         <AutoPlaySwipeableViews
            // autoplay={!videoUrl} // do not auto scroll if video is being played
            autoplay={false}
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
                        livestream={contentItem}
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

type ContentProps = {
   headerTitle: string
   logoUrl?: string
   title?: string
   subtitle: string
   actionItem?: React.ReactNode
}

type LivestreamContentProps = {
   livestream: LivestreamEvent
   handleBannerPlayRecording: (livestream: LivestreamEvent) => void
   handleClickRegister: ReturnType<
      typeof useRegistrationModal
   >["handleClickRegister"]
}
const LivestreamContent: FC<LivestreamContentProps> = ({
   livestream,
   handleBannerPlayRecording,
   handleClickRegister,
}) => {
   const hosts = useLivestreamHosts(livestream)
   const { userStats, userData } = useAuth()

   const livestreamPresenter = useMemo(
      () => LivestreamPresenter.createFromDocument(livestream),
      [livestream]
   )

   const {
      userHasAccessToRecordingThroughRegistering,
      userHasBoughtRecording,
      showRecording,
   } = useRecordingAccess(userData?.userEmail, livestreamPresenter, userStats)

   const eventIsUpcoming = livestream.start.toDate() > new Date()

   const headerTitle = useMemo(() => {
      if (eventIsUpcoming) {
         return "Coming Next!"
      }

      if (userHasAccessToRecordingThroughRegistering) {
         return "What You've Missed"
      }

      return "Worth A Look!"
   }, [eventIsUpcoming, userHasAccessToRecordingThroughRegistering])

   const subtitle = useMemo(() => {
      if (eventIsUpcoming) {
         // Should return something like "Live on 17 April 2023"
         return `Live on ${DateUtil.dateWithYear(livestream.start.toDate())}`
      }

      if (
         !userHasBoughtRecording &&
         userHasAccessToRecordingThroughRegistering
      ) {
         const timeLeft = DateUtil.calculateTimeLeft(
            livestreamPresenter.recordingAccessTimeLeft()
         )

         return timeLeft?.Days === 0
            ? "Last day to rewatch"
            : `Recording available for ${timeLeft.Days} days`
      }

      return ""
   }, [
      eventIsUpcoming,
      livestream.start,
      livestreamPresenter,
      userHasAccessToRecordingThroughRegistering,
      userHasBoughtRecording,
   ])

   const actionItem = useMemo<ReactNode>(() => {
      if (eventIsUpcoming) {
         return (
            <ContentButton
               color={"secondary"}
               onClick={() =>
                  handleClickRegister(livestream, hosts[0]?.id, hosts, false)
               }
            >
               Register to Live Stream
            </ContentButton>
         )
      }

      if (showRecording) {
         return (
            <ContentButton
               color={"primary"}
               onClick={() => handleBannerPlayRecording(livestream)}
               endIcon={<PlayIcon sx={styles.icon} />}
            >
               Watch now
            </ContentButton>
         )
      }

      return (
         <ContentButton
            href={`upcoming-livestream/${livestream.id}`}
            target={"_blank"}
            color={"primary"}
         >
            Discover Recording
         </ContentButton>
      )
   }, [
      eventIsUpcoming,
      handleBannerPlayRecording,
      handleClickRegister,
      hosts,
      livestream,
      showRecording,
   ])

   return (
      <Content
         headerTitle={headerTitle}
         title={livestream.title}
         subtitle={subtitle}
         logoUrl={getResizedUrl(livestream.companyLogoUrl, "lg")}
         actionItem={actionItem}
      />
   )
}
const Content: FC<ContentProps> = ({
   actionItem,
   headerTitle,
   logoUrl,
   subtitle,
   title,
}) => {
   return (
      <Box sx={styles.info}>
         <Stack spacing={1.5} mt={4}>
            <Typography
               variant={"h2"}
               fontWeight="bold"
               component="h1"
               color={"white"}
               gutterBottom
            >
               {headerTitle}
            </Typography>
            {logoUrl ? (
               <Box sx={styles.logoWrapper} mt={2}>
                  <Image
                     objectFit="contain"
                     quality={90}
                     src={logoUrl}
                     alt={title}
                     width={200}
                     height={100}
                  />
               </Box>
            ) : null}
            <Typography
               variant={title.length > 95 ? "h5" : "h4"}
               fontWeight="bold"
               component="h2"
               height="70px"
               color={"white"}
               maxWidth={{ xs: "100%", md: "80%", lg: "60%" }}
            >
               {title}
            </Typography>
            <Typography
               variant={"h6"}
               component="h2"
               fontWeight={"400"}
               color={"white"}
               mt={1}
            >
               {subtitle}
            </Typography>
         </Stack>
         {actionItem ? <Box mt={4}>{actionItem}</Box> : null}
      </Box>
   )
}

type WatchRecordingButtonProps = ButtonProps
const ContentButton: FC<WatchRecordingButtonProps> = ({
   onClick,
   color = "primary",
   href,
   children,
   ...props
}) => {
   return (
      <Button
         // @ts-ignore
         component={href ? Link : undefined}
         href={href}
         onClick={onClick}
         sx={styles.button}
         variant={"contained"}
         color={color}
         disableRipple
         size={"large"}
         {...props}
      >
         {children}
      </Button>
   )
}

export default ContentCarousel
