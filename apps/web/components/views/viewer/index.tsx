import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded"
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded"
import { Backdrop } from "@mui/material"
import { Theme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { useRouter } from "next/router"
import { Fragment, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { useCurrentStream } from "../../../context/stream/StreamContext"
import { RootState } from "../../../store"
import { focusModeEnabledSelector } from "../../../store/selectors/streamSelectors"
import AudienceDrawer from "../streaming/AudienceDrawer"
import IconsContainer from "../streaming/icons-container/IconsContainer"
import ButtonComponent from "../streaming/sharedComponents/ButtonComponent"
import MiniChatContainer from "../streaming/sharedComponents/chat/MiniChatContainer"
import StreamClosedCountdown from "../streaming/sharedComponents/StreamClosedCountdown"
import StreamNotifications from "../streaming/sharedComponents/StreamNotifications"
import RatingContainer from "./rating-container/RatingContainer"
import ViewerComponent from "./viewer-component/ViewerComponent"

const useStyles = makeStyles<Theme>((theme) => ({
   iconsContainer: {
      position: "absolute",
      // @ts-ignore
      bottom: ({ mobile }) => (mobile ? 80 : 60),
      right: 60,
      width: 80,
      zIndex: 7250,
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
   miniChatContainer: {
      position: "absolute",
      bottom: "0",
      right: "40px",
      width: "20%",
      minWidth: "250px",
      zIndex: 998,
   },
   blackFrame: {
      display: "flex",
      zIndex: 10,
      backgroundColor: "black",
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "0",
      top: 0,
   },
}))

const ViewerOverview = ({
   handRaiseActive,
   handleStateChange,
   selectedState,
   showMenu,
   hideAudience,
   audienceDrawerOpen,
}) => {
   const focusModeEnabled = useSelector(focusModeEnabledSelector)

   const {
      query: { isRecordingWindow },
   } = useRouter()
   const { currentLivestream, isMobile: mobile, presenter } = useCurrentStream()
   const dispatch = useDispatch()
   const { videoIsMuted, videoIsPaused } = useSelector(
      (state: RootState) => state.stream.streaming
   )

   const classes = useStyles({ mobile })

   const unmuteMutedRemoteVideosAfterFail = useCallback(
      () => dispatch(actions.unmuteMutedRemoteVideosAfterFail()),
      [dispatch]
   )

   const unpauseRemoteVideosAfterFail = useCallback(() => {
      dispatch(actions.unpauseRemoteVideosAfterFail())
      dispatch(actions.unmuteMutedRemoteVideosAfterFail())
   }, [dispatch])

   const enableEmotions = isRecordingWindow || !focusModeEnabled

   return (
      <Fragment>
         <div className={classes.blackFrame}>
            <AudienceDrawer
               hideAudience={hideAudience}
               audienceDrawerOpen={audienceDrawerOpen}
               isStreamer={false}
            />
            {!isRecordingWindow && (
               <ButtonComponent
                  streamFinished={presenter?.streamHasFinished()}
                  selectedState={selectedState}
                  showMenu={showMenu}
                  isMobile={mobile}
                  handleStateChange={handleStateChange}
                  streamer={false}
                  includeJobs={currentLivestream.hasJobs}
                  questionsAreDisabled={currentLivestream.questionsDisabled}
               />
            )}
            <ViewerComponent
               showMenu={showMenu}
               handRaiseActive={handRaiseActive}
            />
            {!focusModeEnabled && (
               <MiniChatContainer
                  mobile={mobile}
                  className={classes.miniChatContainer}
               />
            )}
         </div>
         {Boolean(enableEmotions) && (
            <IconsContainer
               className={classes.iconsContainer}
               livestreamId={currentLivestream.id}
            />
         )}
         {Boolean(currentLivestream && !currentLivestream.hasNoRatings) && (
            <RatingContainer
               livestreamId={currentLivestream.id}
               livestream={currentLivestream}
            />
         )}
         <StreamNotifications isStreamer={false} />
         <Backdrop
            open={Boolean(videoIsMuted && !isRecordingWindow)}
            className={classes.backdrop}
            onClick={unmuteMutedRemoteVideosAfterFail}
         >
            <div className={classes.backdropContent}>
               <VolumeUpRoundedIcon style={{ fontSize: "3rem" }} />
               <div>Click to unmute</div>
            </div>
         </Backdrop>
         <Backdrop
            open={Boolean(videoIsPaused && !isRecordingWindow)}
            className={classes.backdrop}
            onClick={unpauseRemoteVideosAfterFail}
         >
            <div className={classes.backdropContent}>
               <PlayArrowRoundedIcon style={{ fontSize: "3rem" }} />
               <div>Click to play</div>
            </div>
         </Backdrop>
         <StreamClosedCountdown />
      </Fragment>
   )
}

export default ViewerOverview
