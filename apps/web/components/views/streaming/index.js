import React, { Fragment, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import VideoContainer from "./video-container/VideoContainer"
import NotificationsContainer from "./notifications-container/NotificationsContainer"
import MiniChatContainer from "./LeftMenu/categories/chat/MiniChatContainer"
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

const useStyles = makeStyles((theme) => ({
   blackFrame: {
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
      zIndex: 1,
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
}))

const StreamerOverview = ({
   isStreamer,
   showAudience,
   setSliding,
   selectedState,
   handleStateChange,
   setNumberOfViewers,
   showMenu,
   notifications,
   streamerId,
   smallScreen,
   hideAudience,
   audienceDrawerOpen,
}) => {
   const { currentLivestream, isBreakout } = useCurrentStream()
   const [mounted, setMounted] = useState(false)
   const classes = useStyles()
   const dispatch = useDispatch()
   const { videoIsMuted, videoIsPaused } = useSelector(
      (state) => state.stream.streaming
   )

   useEffect(() => {
      setMounted(true)
   }, [])

   if (!mounted) return null

   return (
      <Fragment>
         <div id="videoBlackFrame" className={classes.blackFrame}>
            <VideoContainer
               currentLivestream={currentLivestream}
               streamerId={streamerId}
               smallScreen={smallScreen}
               setNumberOfViewers={setNumberOfViewers}
               isStreamer={isStreamer}
               isBreakout={isBreakout}
               showMenu={showMenu}
               viewer={false}
            />
            <ButtonComponent
               streamer={true}
               setSliding={setSliding}
               selectedState={selectedState}
               showMenu={showMenu}
               handleStateChange={handleStateChange}
               includeJobs={currentLivestream.jobs?.length > 0}
            />
         </div>
         <AudienceDrawer
            hideAudience={hideAudience}
            audienceDrawerOpen={audienceDrawerOpen}
            isStreamer
         />
         <NotificationsContainer
            livestreamId={currentLivestream.id}
            handRaiseMenuOpen={selectedState === "hand"}
            notifications={notifications}
         />
         <StreamNotifications isStreamer={true} />
         <HandRaiseNotifier />
         <MiniChatContainer
            className={classes.miniChatContainer}
            livestream={currentLivestream}
            isStreamer={isStreamer}
         />

         <IconsContainer
            className={classes.iconsContainer}
            isTest={currentLivestream.test}
            livestreamId={currentLivestream.id}
         />
         <Backdrop
            open={videoIsMuted}
            className={classes.backdrop}
            onClick={() => dispatch(actions.unmuteMutedRemoteVideosAfterFail())}
         >
            <div className={classes.backdropContent}>
               <VolumeUpRoundedIcon style={{ fontSize: "3rem" }} />
               <div>Click to unmute</div>
            </div>
         </Backdrop>
         <Backdrop
            open={videoIsPaused}
            className={classes.backdrop}
            onClick={() => dispatch(actions.unpauseRemoteVideosAfterFail())}
         >
            <div className={classes.backdropContent}>
               <PlayArrowRoundedIcon style={{ fontSize: "3rem" }} />
               <div>Click to play</div>
            </div>
         </Backdrop>
      </Fragment>
   )
}

export default StreamerOverview
