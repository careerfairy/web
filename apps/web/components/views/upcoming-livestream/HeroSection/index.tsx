import { useCallback, useEffect, useState } from "react"
import { alpha, darken, useTheme } from "@mui/material/styles"
import {
   Avatar,
   Box,
   Container,
   Grid,
   Hidden,
   IconButton,
   Paper,
   Typography,
   useMediaQuery,
} from "@mui/material"
import CountDown from "./CountDown"
import HeroSpeakers from "./HeroSpeakers"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import HeroHosts from "./HeroHosts"
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../common/NextLivestreams/GroupStreams/groupStreamCard/badges"
import WhiteTagChip from "../../common/chips/TagChip"
import LanguageIcon from "@mui/icons-material/Language"
import Image from "next/image"
import JobApply from "./JobApply"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import { EnsureUserIsLoggedIn } from "../../../../HOCs/AuthSuspenseHelpers"
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"
import useIsMobile from "../../../custom-hook/useIsMobile"
import RecordingPlayer from "../RecordingPlayer"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useCountTime from "../../../custom-hook/useCountTime"
import { errorLogAndNotify } from "util/CommonUtil"

const getMinHeight = (smallVerticalScreen, showBigVideoPlayer) => {
   if (showBigVideoPlayer) {
      if (smallVerticalScreen) {
         return "800px !important"
      }
   }
   if (smallVerticalScreen) {
      return "190vh !important"
   }
   return "auto"
}

const styles = {
   root: (theme, smallVerticalScreen, showBigVideoPlayer) => ({
      minHeight: getMinHeight(smallVerticalScreen, showBigVideoPlayer),
      position: "relative",
      backgroundSize: "cover",
      zIndex: 2,
      backgroundPosition: "center center",
      backgroundAttachment: "fixed",
      [theme.breakpoints.up("md")]: {
         minHeight: "100vh",
      },
      "&:after": {
         position: "absolute",
         inset: "0px",
         height: "100%",
         width: "100%",
         content: '" "',
         zIndex: 1,
         backgroundColor: darken(theme.palette.navyBlue.main, 0.5),
         backgroundAttachment: "fixed",
         opacity: 0.7,
      },
   }),
   containerWrapper: (theme) => ({
      [theme.breakpoints.up("md")]: {
         position: "absolute",
         top: "50%",
         transform: "translateY(-50%)",
      },
      width: "100%",
      zIndex: 2,
      position: "relative",
      top: 0,
   }),
   container: (theme) => ({
      [theme.breakpoints.up("sm")]: {
         paddingTop: theme.spacing(8),
         paddingBottom: theme.spacing(6),
      },
      [theme.breakpoints.up("md")]: {
         paddingTop: theme.spacing(8),
         paddingBottom: theme.spacing(8),
      },
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
   }),
   gridContainer: {
      color: (theme) => theme.palette.common.white,
   },
   leftGridItem: {
      display: "flex",
      justifyContent: "space-evenly",
      flexDirection: "column",
   },
   title: (theme) => ({
      [theme.breakpoints.down("md")]: {
         fontSize: "calc(1.5em + 1.5vw)",
      },
      fontWeight: 600,
   }),
   timerWrapper: {
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
   companyLogo: {
      padding: (theme) => theme.spacing(2),
      borderRadius: (theme) => theme.spacing(1),
      boxShadow: (theme) => theme.shadows[4],
      background: (theme) => theme.palette.common.white,
      width: "fit-content",
      height: "fit-content",
      "& img": {
         borderRadius: (theme) => theme.spacing(1),
         maxHeight: 90,
         maxWidth: 280,
         objectFit: "contain",
      },
   },
   heroSpeakersWrapper: {
      marginTop: (theme) => theme.spacing(2),
      color: "inherit",
      textDecoration: "none !important",
      display: "flex",
   },
   tagsWrapper: {
      paddingTop: (theme) => theme.spacing(2),
      display: "flex",
      flexWrap: "wrap",
      "& .MuiChip-root": {
         margin: {
            xs: 0.5,
            md: 1,
         },
         marginLeft: 0,
      },
   },
   chip: {
      height: { sm: "2.78rem" },
      margin: { sm: "0.6em" },
      "& svg": {
         fontSize: { sm: "2.25rem" },
      },
      "& span": {
         fontSize: { sm: "1.7rem" },
      },
   },
   countdown: (theme) => ({
      padding: theme.spacing(2),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
         padding: theme.spacing(3),
      },
      borderRadius: theme.spacing(1),
   }),
   scrollButtonWrapper: {
      position: "inherit",
      display: "flex",
      justifyContent: "center",
      alignContent: "end",
      alignItems: "self-end",
      height: "100%",
   },
   scrollButton: (theme) => ({
      zIndex: 99,
      background: `${alpha(theme.palette.common.white, 0.2)} !important`,
      backdropFilter: "blur(5px)",
      borderRadius: "8px 8px 0 0",
      width: "70px",
      padding: "5px 0",
      height: "35px",

      "&:hover svg": {
         fontSize: "32px",
         backgroundColor: "unset",
      },
   }),
}

const HeroSection = ({
   backgroundImage,
   onRegisterClick,
   disabled,
   registered,
   stream,
   streamPresenter,
   hosts,
   numberOfSpotsRemaining,
   eventInterests,
   streamAboutToStart,
   streamLanguage,
   showScrollButton = false,
   isPastEvent,
   showRecording = false,
   userHasBoughtRecording = false,
   userIsLoggedIn = false,
}) => {
   const theme = useTheme()
   const isMobile = useIsMobile()
   const smallVerticalScreen = useMediaQuery("(max-height:700px)") && !isMobile
   const { userData } = useAuth()
   const [recordingSid, setRecordingSid] = useState(null)

   const {
      timeWatched: minutesWatched,
      startCounting,
      pauseCounting,
   } = useCountTime()

   const [showBigVideoPlayer, setShowBigVideoPlayer] = useState(false)

   /**
    * Each minute watched the field minutesWatched will be increased and we need do increment it on our DB
    */
   useEffect(() => {
      if (minutesWatched > 0) {
         void livestreamRepo.updateRecordingStats({
            livestreamId: stream.id,
            minutesWatched: 1,
            onlyIncrementMinutes: true,
         })
      }
   }, [minutesWatched])

   useEffect(() => {
      // fetch the recordingSid if the recording is available
      // we need to fetch it on the client because the user might
      // buy access to the recording after the page is loaded
      if (showRecording && !recordingSid) {
         livestreamRepo
            .getLivestreamRecordingToken(stream.id)
            .then((doc) => {
               setRecordingSid(doc.sid)
            })
            .catch(errorLogAndNotify)
      }
   }, [recordingSid, showRecording, stream.id])

   const renderTagsContainer = Boolean(
      stream.isFaceToFace ||
         stream.maxRegistrants ||
         streamLanguage ||
         eventInterests?.length
   )

   // handle play recording click
   const handleRecordingPlay = useCallback(() => {
      startCounting()

      if (!isMobile) {
         // update to a bigger screen on desktop
         setShowBigVideoPlayer(true)
      }
   }, [isMobile, startCounting])

   // handle preview play icon click
   const handlePreviewPlay = useCallback(() => {
      // update recording stats
      void livestreamRepo.updateRecordingStats({
         livestreamId: stream.id,
         userId: userData.userEmail,
         livestreamStartDate: stream.start,
      })

      // play recording
      handleRecordingPlay()
   }, [handleRecordingPlay, stream?.id, stream?.start, userData?.userEmail])

   const handleCloseRecordingPlayer = useCallback(() => {
      setShowBigVideoPlayer(false)
   }, [])

   const renderRecordingVideo = useCallback(
      () => (
         <Box pt={1}>
            <RecordingPlayer
               boughtAccess={userHasBoughtRecording}
               handlePlay={handleRecordingPlay}
               handlePause={pauseCounting}
               handleClosePlayer={handleCloseRecordingPlayer}
               stream={streamPresenter}
               showBigVideoPlayer={showBigVideoPlayer}
               recordingSid={recordingSid}
               handlePreviewPlay={handlePreviewPlay}
            />
         </Box>
      ),
      [
         streamPresenter,
         userHasBoughtRecording,
         handleCloseRecordingPlayer,
         handlePreviewPlay,
         handleRecordingPlay,
         pauseCounting,
         recordingSid,
         showBigVideoPlayer,
      ]
   )

   const renderDefaultContent = useCallback(
      () => (
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <Box display="flex">
                  <Avatar
                     title={stream.company}
                     src={getResizedUrl(stream.companyLogoUrl, "md")}
                     sx={styles.companyLogo}
                  />
               </Box>
            </Grid>
            <Grid item xs={12}>
               <Box sx={styles.timerWrapper}>
                  <Paper sx={styles.countdown}>
                     <CountDown
                        time={stream.start?.toDate?.() || null}
                        stream={stream}
                        streamAboutToStart={streamAboutToStart}
                        onRegisterClick={onRegisterClick}
                        disabled={disabled}
                        registered={registered}
                        isPastEvent={isPastEvent}
                        userIsLoggedIn={userIsLoggedIn}
                     />
                     {stream?.jobs?.length > 0 && (
                        <EnsureUserIsLoggedIn>
                           <SuspenseWithBoundary hide fallback="">
                              <JobApply livestream={stream} />
                           </SuspenseWithBoundary>
                        </EnsureUserIsLoggedIn>
                     )}
                  </Paper>
               </Box>
            </Grid>
            {!!hosts.length && (
               <Grid item xs={12}>
                  <HeroHosts hosts={hosts} />
               </Grid>
            )}
         </Grid>
      ),
      [
         isPastEvent,
         disabled,
         hosts,
         onRegisterClick,
         registered,
         stream,
         streamAboutToStart,
      ]
   )

   const renderHostedByInfo = useCallback(
      () => (
         <Box
            display="flex"
            mt={4}
            pl={{ xs: 2, md: 0 }}
            alignItems={"start"}
            flexDirection={{ xs: "column", lg: "row" }}
         >
            <Avatar
               title={stream.company}
               src={getResizedUrl(stream.companyLogoUrl, "md")}
               sx={{ ...styles.companyLogo, maxWidth: "250px" }}
            />
            <Box ml={{ xs: 0, lg: 2 }} mt={{ xs: 1, lg: 0 }}>
               <Typography variant={"body1"}>Hosted by</Typography>
               <Typography
                  variant={stream?.company?.length > 20 ? "h6" : "h5"}
                  fontWeight="bold"
                  component="h1"
               >
                  {stream.company}
               </Typography>
            </Box>
         </Box>
      ),
      [stream.company, stream.companyLogoUrl]
   )

   return (
      <Box sx={styles.root(theme, smallVerticalScreen, showBigVideoPlayer)}>
         <Image
            src={backgroundImage}
            alt={stream.title}
            layout="fill"
            objectFit="cover"
            quality={90}
         />
         <Box sx={styles.containerWrapper}>
            <Container sx={styles.container}>
               <Grid sx={styles.gridContainer} spacing={2} container>
                  <Grid
                     sx={{
                        ...styles.leftGridItem,
                        display: showBigVideoPlayer ? "none" : "inherit",
                     }}
                     item
                     xs={12}
                     md={6}
                  >
                     <Typography
                        variant={stream?.title?.length > 95 ? "h4" : "h2"}
                        component="h1"
                        sx={styles.title}
                     >
                        {stream.title}
                     </Typography>
                     {renderTagsContainer ? (
                        <Box sx={styles.tagsWrapper}>
                           {stream.isFaceToFace ? (
                              <InPersonEventBadge sx={styles.chip} white />
                           ) : null}
                           {stream.maxRegistrants ? (
                              <LimitedRegistrationsBadge
                                 sx={styles.chip}
                                 white
                                 numberOfSpotsRemaining={numberOfSpotsRemaining}
                              />
                           ) : null}
                           {streamLanguage ? (
                              <WhiteTagChip
                                 sx={styles.chip}
                                 icon={<LanguageIcon />}
                                 variant={"outlined"}
                                 tooltipText={`This event is in ${streamLanguage.name}`}
                                 label={streamLanguage.code.toUpperCase()}
                              />
                           ) : null}
                           {eventInterests.map((interest) => (
                              <WhiteTagChip
                                 key={interest.id}
                                 sx={styles.chip}
                                 variant={"outlined"}
                                 label={interest.name}
                              />
                           ))}
                        </Box>
                     ) : null}
                     {!!stream?.speakers?.length && (
                        <Hidden smDown>
                           <Box
                              component="a"
                              sx={styles.heroSpeakersWrapper}
                              href="#speakers"
                           >
                              <HeroSpeakers speakers={stream.speakers} />
                           </Box>
                        </Hidden>
                     )}
                     {showRecording && !isMobile ? renderHostedByInfo() : null}
                  </Grid>
                  <Grid item xs={12} md={showBigVideoPlayer ? 12 : 6}>
                     {showRecording
                        ? renderRecordingVideo()
                        : renderDefaultContent()}
                  </Grid>
                  {showRecording && isMobile && !showBigVideoPlayer
                     ? renderHostedByInfo()
                     : null}
               </Grid>
            </Container>
         </Box>
         {showScrollButton && !isMobile ? (
            <Box sx={styles.scrollButtonWrapper}>
               <IconButton
                  sx={styles.scrollButton}
                  size="large"
                  href={"#about"}
               >
                  <KeyboardDoubleArrowDownIcon
                     sx={{ fontSize: "25px" }}
                     color={"info"}
                  />
               </IconButton>
            </Box>
         ) : null}
      </Box>
   )
}

export default HeroSection
