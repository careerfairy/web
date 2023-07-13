import React, { useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import {
   AppBar,
   Badge,
   Box,
   Button,
   Checkbox,
   Hidden,
   IconButton,
   Toolbar,
   Tooltip,
   Typography,
   useMediaQuery,
} from "@mui/material"
import { MainLogo, MiniLogo } from "../../../components/logos"
import {
   StandartTooltip,
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
} from "../../../materialUI/GlobalTooltips"
import ButtonWithConfirm from "../../../components/views/common/ButtonWithConfirm"
import StopIcon from "@mui/icons-material/Stop"
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import StudentViewIcon from "@mui/icons-material/FaceRounded"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import BreakoutRoomIcon from "@mui/icons-material/Widgets"
import PeopleIcon from "@mui/icons-material/People"
import { useThemeToggle } from "../../../context/theme/ThemeContext"
import SpeakerManagementModal from "../../../components/views/streaming/modal/SpeakerManagementModal"
import { useCurrentStream } from "../../../context/stream/StreamContext"
import { maybePluralize } from "../../../components/helperFunctions/HelperFunctions"
import NewFeatureHint from "../../../components/util/NewFeatureHint"
import useStreamToken from "../../../components/custom-hook/useStreamToken"
import useStreamRef from "../../../components/custom-hook/useStreamRef"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { TOP_BAR_HEIGHT } from "constants/streamLayout"
import { localStorageAudienceDrawerKey } from "constants/localStorageKeys"
import { RootState } from "../../../store"
import { useNumberOfViewers } from "context/stream/useNumberOfViewers"

const styles = {
   toolbar: {
      minHeight: [TOP_BAR_HEIGHT, "important"],
      display: "flex",
      justifyContent: "space-between",
   },
   streamStatusText: {
      fontWeight: 600,
   },
   statusActiveColor: {
      color: (theme) => theme.palette.primary.main,
   },
   statusInactiveColor: {
      color: (theme) => theme.palette.warning.main,
   },
   viewCount: {
      // background: theme.palette.primary.main,
      color: (theme) => theme.palette.primary.main,
      padding: (theme) => theme.spacing(0, 1),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   viewCountText: {
      fontWeight: 600,
      marginLeft: (theme) => theme.spacing(0.5),
   },
}

const StreamerTopBar = ({ firebase, showAudience }) => {
   const { currentLivestream, isBreakout, isMainStreamer, isStreamer } =
      useCurrentStream()

   const dispatch = useDispatch()
   const streamRef = useStreamRef()
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("lg"))
   const { toggleTheme, themeMode } = useThemeToggle()

   const numberOfViewers = useNumberOfViewers(currentLivestream)

   const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false)
   const [hideTooltip, setHideTooltip] = useState(false)
   const [speakerManagementOpen, setSpeakerManagementOpen] = useState(false)
   const { joiningStreamerLink, viewerLink } = useStreamToken()

   const streamerIsPublished = useSelector((state: RootState) => {
      return state.stream.streaming.isPublished
   })

   useEffect(() => {
      if (currentLivestream.start) {
         let interval = setInterval(() => {
            if (dateIsInUnder2Minutes(currentLivestream.start.toDate())) {
               setStreamStartTimeIsNow(true)
               clearInterval(interval)
            }
         }, 1000)
      }
   }, [currentLivestream?.start])

   function dateIsInUnder2Minutes(date) {
      return (
         new Date(date).getTime() - Date.now() < 1000 * 60 * 2 ||
         Date.now() > new Date(date).getTime()
      )
   }

   function setStreamingStarted(started) {
      firebase.setLivestreamHasStarted(started, streamRef)
   }

   const handleOpenBreakoutRoomModal = () => {
      dispatch(actions.openStreamerBreakoutModal())
   }

   return (
      <>
         <AppBar elevation={1} color="transparent">
            <Toolbar sx={styles.toolbar}>
               <Hidden mdDown>
                  <MainLogo white={theme.palette.mode === "dark"} />
               </Hidden>
               <Hidden mdUp>
                  <MiniLogo />
               </Hidden>
               {(isMainStreamer || (isStreamer && isBreakout)) && (
                  <>
                     <StandartTooltip
                        arrow
                        open={
                           !streamStartTimeIsNow &&
                           !hideTooltip &&
                           streamerIsPublished
                        }
                        placement="bottom"
                        title={
                           <>
                              <TooltipTitle>Start Streaming</TooltipTitle>
                              <TooltipText>
                                 {`The Start Streaming button will become active 2
                                 minutes before the stream's official start
                                 time.`}
                              </TooltipText>
                              <TooltipButtonComponent
                                 onConfirm={() => setHideTooltip(true)}
                                 buttonText="Ok"
                              />
                           </>
                        }
                     >
                        <ButtonWithConfirm
                           color={
                              currentLivestream.hasStarted
                                 ? theme.palette.error.main
                                 : theme.palette.primary.main
                           }
                           hasStarted={currentLivestream.hasStarted}
                           noLabel={mobile}
                           disabled={!streamStartTimeIsNow}
                           startIcon={
                              currentLivestream.hasStarted ? (
                                 <StopIcon />
                              ) : (
                                 <PlayCircleFilledWhiteIcon />
                              )
                           }
                           buttonAction={() =>
                              setStreamingStarted(!currentLivestream.hasStarted)
                           }
                           confirmDescription={
                              currentLivestream.hasStarted
                                 ? "Are you sure that you want to end your livestream now?"
                                 : "Are you sure that you want to start your livestream now?"
                           }
                           buttonLabel={
                              currentLivestream.hasStarted
                                 ? `Stop ${mobile ? "" : "Streaming"}`
                                 : `Start ${mobile ? "" : "Streaming"}`
                           }
                           tooltipTitle={
                              currentLivestream.hasStarted
                                 ? `Click here to stop streaming`
                                 : `Click here to start streaming`
                           }
                        />
                     </StandartTooltip>
                  </>
               )}
               {mobile ? (
                  <Tooltip
                     title={
                        currentLivestream.hasStarted
                           ? "You are currently actively streaming"
                           : "You are currently not streaming"
                     }
                  >
                     <Typography
                        sx={[
                           styles.streamStatusText,
                           currentLivestream?.hasStarted
                              ? styles.statusActiveColor
                              : styles.statusInactiveColor,
                        ]}
                        variant="h5"
                     >
                        {currentLivestream.hasStarted ? "LIVE" : "NOT LIVE"}
                     </Typography>
                  </Tooltip>
               ) : (
                  <Box
                     display="flex"
                     flexDirection="column"
                     justifyContent="center"
                  >
                     <Typography
                        sx={[
                           styles.streamStatusText,
                           currentLivestream?.hasStarted
                              ? styles.statusActiveColor
                              : styles.statusInactiveColor,
                        ]}
                        variant="h5"
                     >
                        {currentLivestream.hasStarted
                           ? "YOU ARE LIVE"
                           : "YOU ARE NOT LIVE"}
                     </Typography>
                     {currentLivestream.hasStarted
                        ? ""
                        : "Press Start Streaming to begin"}
                  </Box>
               )}
               <Box display="flex" alignItems="center">
                  {
                     <Tooltip title="Invite an additional streamer">
                        <IconButton
                           onClick={() => {
                              setSpeakerManagementOpen(true)
                           }}
                           size="large"
                        >
                           <PersonAddIcon color="inherit" />
                        </IconButton>
                     </Tooltip>
                  }

                  <Tooltip title="Manage breakout rooms">
                     <IconButton
                        onClick={handleOpenBreakoutRoomModal}
                        size="large"
                     >
                        <BreakoutRoomIcon />
                     </IconButton>
                  </Tooltip>
                  {mobile ? null : (
                     <Tooltip title="Open Student View">
                        <IconButton
                           target="_blank"
                           href={viewerLink}
                           size="large"
                        >
                           <StudentViewIcon color="inherit" />
                        </IconButton>
                     </Tooltip>
                  )}
                  {mobile ? null : (
                     <Tooltip
                        title={
                           themeMode === "dark"
                              ? "Switch to light theme"
                              : "Switch to dark mode"
                        }
                     >
                        <Checkbox
                           checked={themeMode === "dark"}
                           onChange={toggleTheme}
                           icon={<Brightness4Icon />}
                           checkedIcon={<Brightness7Icon />}
                           color="default"
                        />
                     </Tooltip>
                  )}
                  <NewFeatureHint
                     // onClick={showAudience}
                     hide={!streamerIsPublished}
                     tooltipText="Click here to see who's joined the stream since the start"
                     localStorageKey={localStorageAudienceDrawerKey}
                     tooltipTitle="Hint"
                  >
                     <Box sx={styles.viewCount}>
                        {mobile ? (
                           <Tooltip title="See who joined">
                              <IconButton
                                 color="inherit"
                                 onClick={showAudience}
                                 size="large"
                              >
                                 <Badge
                                    max={999999}
                                    color="secondary"
                                    badgeContent={mobile ? numberOfViewers : 0}
                                 >
                                    <PeopleIcon />
                                 </Badge>
                              </IconButton>
                           </Tooltip>
                        ) : (
                           <Tooltip
                              title={`You currently have ${numberOfViewers} ${maybePluralize(
                                 numberOfViewers,
                                 "viewer"
                              )}`}
                           >
                              <Button
                                 color="primary"
                                 size="large"
                                 startIcon={
                                    <Badge
                                       max={999999}
                                       color="secondary"
                                       anchorOrigin={{
                                          vertical: "top",
                                          horizontal: "right",
                                       }}
                                       badgeContent={numberOfViewers}
                                    >
                                       <PeopleIcon />
                                    </Badge>
                                 }
                                 onClick={showAudience}
                              >
                                 See who joined
                              </Button>
                           </Tooltip>
                        )}
                     </Box>
                  </NewFeatureHint>
               </Box>
            </Toolbar>
         </AppBar>
         <SpeakerManagementModal
            livestreamId={currentLivestream.id}
            open={speakerManagementOpen}
            joiningStreamerLink={joiningStreamerLink}
            setOpen={setSpeakerManagementOpen}
         />
      </>
   )
}

export default StreamerTopBar
