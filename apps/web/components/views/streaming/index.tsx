import React, { useCallback, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import VideoContainer from "./video-container/VideoContainer"
import NotificationsContainer from "./notifications-container/NotificationsContainer"
import MiniChatContainer from "./sharedComponents/chat/MiniChatContainer"
import IconsContainer from "./icons-container/IconsContainer"
import { useCurrentStream } from "../../../context/stream/StreamContext"
import StreamNotifications from "./sharedComponents/StreamNotifications"
import AudienceDrawer from "./AudienceDrawer"
import ButtonComponent from "./sharedComponents/ButtonComponent"
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded"
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded"
import { Backdrop } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import HandRaiseNotifier from "./LeftMenu/categories/hand-raise/active/HandRaiseNotifier"
import { alpha } from "@mui/material/styles"
import {
   showActionButtonsSelector,
   streamingSelector,
} from "../../../store/selectors/streamSelectors"
import { dataLayerEvent } from "../../../util/analyticsUtils"

const useStyles = makeStyles((theme) => ({
   blackFrame: {
      // @ts-ignore
      transitionTimingFunction: theme.transitions.easeInOut,
      // zIndex: 10,
      display: "flex",
      height: "inherit",
      position: "relative",
   },
   miniChatContainer: {
      position: "absolute",
      bottom: 0,
      right: 40,
      width: "20%",
      minWidth: 250,
      zIndex: 2,
   },
   iconsContainer: {
      position: "absolute",
      bottom: 60,
      right: 100,
      zIndex: 1,
      width: 80,
   },
   backdrop: {
      cursor: "pointer",
      zIndex: 200,
   },
   backdropContent: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: theme.palette.common.white,
   },
   infoText: {
      position: "absolute",
      bottom: 150,
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: 15,
      borderRadius: 30,
      fontWeight: "bold",
      color: theme.palette.common.white,
      boxShadow: theme.shadows[2],
      backgroundColor: alpha(theme.palette.common.black, 0.3),
      backdropFilter: "blur(5px)",
      maxWidth: "100%",
      zIndex: 99,
   },
}))

const StreamerOverview = ({
   selectedState,
   handleStateChange,
   showMenu,
   smallScreen,
   hideAudience,
   audienceDrawerOpen,
}) => {
   const { currentLivestream } = useCurrentStream()
   const [mounted, setMounted] = useState(false)
   const [showTapHint, setShowTapHint] = useState(smallScreen)
   const classes = useStyles()
   const dispatch = useDispatch()
   const { videoIsMuted, videoIsPaused } = useSelector(streamingSelector)
   const showActionButtons = useSelector(showActionButtonsSelector)

   const unmuteMutedRemoteVideosAfterFail = useCallback(
      () => dispatch(actions.unmuteMutedRemoteVideosAfterFail()),
      [dispatch]
   )

   const unpauseRemoteVideosAfterFail = useCallback(
      () => dispatch(actions.unpauseRemoteVideosAfterFail()),
      [dispatch]
   )

   useEffect(() => {
      setMounted(true)
      setTimeout(() => {
         setShowTapHint(false)
      }, 20000)
   }, [])

   /**
    * If the screen size changes to something other than small, we always want to show the action buttons
    */
   useEffect(() => {
      if (!smallScreen) {
         dispatch(actions.showActionButtons())
      }
   }, [smallScreen])

   /**
    * On mobile the visibility of the buttons will be handled based on stream frame click
    */
   const handleClick = useCallback(
      ({ target }) => {
         if (smallScreen) {
            const streamElement = document.getElementById("videoBlackFrame")
            const actionButtons = document.getElementById("streamActionButtons")
            const controllerButtons = document.getElementById(
               "streamControllerButtons"
            )

            const clickedOnVideoFrame = streamElement.contains(target)
            const clickedOnButtons = [actionButtons, controllerButtons].some(
               (selector) => selector.contains(target)
            )

            if (!showActionButtons && clickedOnVideoFrame) {
               dispatch(actions.showActionButtons())
            } else if (clickedOnVideoFrame && !clickedOnButtons) {
               dispatch(
                  showActionButtons
                     ? actions.hideActionButtons()
                     : actions.showActionButtons()
               )

               // The click was valid and the TapHint is visible. We want to hide it
               if (showTapHint) {
                  setShowTapHint(false)
               }
            }
         }
      },
      [smallScreen, showActionButtons, dispatch, showTapHint]
   )

   const openSupportInLeftMenu = useCallback(() => {
      handleStateChange("support")
      dataLayerEvent("livestream_open_support")
   }, [handleStateChange])

   if (!mounted) return null

   return (
      <>
         <div
            id="videoBlackFrame"
            className={classes.blackFrame}
            onClick={handleClick}
         >
            <VideoContainer
               smallScreen={smallScreen}
               showMenu={showMenu}
               viewer={false}
               openSupportInLeftMenu={openSupportInLeftMenu}
            />
            <ButtonComponent
               streamFinished={false}
               isMobile={undefined}
               streamer={true}
               selectedState={selectedState}
               showMenu={showMenu}
               handleStateChange={handleStateChange}
               includeJobs={currentLivestream.hasJobs}
               questionsAreDisabled={currentLivestream.questionsDisabled}
            />
            {showTapHint && (
               <div className={classes.infoText}>Tap to hide controllers</div>
            )}
         </div>
         <AudienceDrawer
            hideAudience={hideAudience}
            audienceDrawerOpen={audienceDrawerOpen}
            isStreamer
         />
         <NotificationsContainer handRaiseMenuOpen={selectedState === "hand"} />
         <StreamNotifications isStreamer={true} />
         <HandRaiseNotifier />
         <MiniChatContainer className={classes.miniChatContainer} />

         <IconsContainer
            className={classes.iconsContainer}
            livestreamId={currentLivestream.id}
         />
         <Backdrop
            open={videoIsMuted}
            className={classes.backdrop}
            onClick={unmuteMutedRemoteVideosAfterFail}
         >
            <div className={classes.backdropContent}>
               <VolumeUpRoundedIcon style={{ fontSize: "3rem" }} />
               <div>Click to unmute</div>
            </div>
         </Backdrop>
         <Backdrop
            open={videoIsPaused}
            className={classes.backdrop}
            onClick={unpauseRemoteVideosAfterFail}
         >
            <div className={classes.backdropContent}>
               <PlayArrowRoundedIcon style={{ fontSize: "3rem" }} />
               <div>Click to play</div>
            </div>
         </Backdrop>
      </>
   )
}

export default StreamerOverview
