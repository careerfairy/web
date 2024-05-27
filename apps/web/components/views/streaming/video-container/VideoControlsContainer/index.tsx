import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { HandRaiseState } from "@careerfairy/shared-lib/src/livestreams/hand-raise"
import CheckIcon from "@mui/icons-material/Check"
import StudentViewIcon from "@mui/icons-material/FaceRounded"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import JoinAsStreamerIcon from "@mui/icons-material/RecordVoiceOver"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import SettingsIcon from "@mui/icons-material/Settings"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import YouTubeIcon from "@mui/icons-material/YouTube"
import LoadingButton from "@mui/lab/LoadingButton"
import {
   Box,
   CircularProgress,
   ClickAwayListener,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@mui/material"
import Button from "@mui/material/Button"
import SpeedDial from "@mui/material/SpeedDial"
import SpeedDialAction from "@mui/material/SpeedDialAction"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import { useTheme } from "@mui/material/styles"
import useHandRaiseState from "components/custom-hook/useHandRaiseState"
import useStreamRef from "components/custom-hook/useStreamRef"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import TutorialContext from "context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips"
import React, {
   memo,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import * as storeActions from "store/actions"
import { showActionButtonsSelector } from "../../../../../store/selectors/streamSelectors"
import useSliderFullyOpened from "../../../../custom-hook/useSliderFullyOpened"
import NewFeatureHint from "../../../../util/NewFeatureHint"
import ShareYoutubeVideoModal from "../../modal/ShareYoutubeVideoModal"
import CallToActionDrawer from "./CallToActionDrawer"
import { CallToActionIcon, ShareIcon, SharePdfIcon } from "./Icons"
import ShareMenu from "./ShareMenu"

const styles = {
   root: {
      position: "absolute",
      right: 0,
      top: 0,
      height: "50%",
      transform: "translateY(50%)",
      width: 120,
      padding: "30px",
      backgroundColor: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      zIndex: 2,
   },
   speedDial: {
      transition: "transform 0.2s",
      transitionTimingFunction: (theme) => theme.transitions.easeInOut,
      transform: "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-moz-transform": "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-o-transform": "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-webkit-transform": "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
   },
   speedDialOpen: {
      transform: "",
      "-moz-transform": "",
      "-o-transform": "",
      "-webkit-transform": "",
   },
   speedDialAction: {
      "& .MuiSpeedDialAction-staticTooltipLabel": {
         transition: "all 0.8s",
         transitionTimingFunction: (theme) => theme.transitions.easeInOut,
         display: "none",
         whiteSpace: "nowrap",
      },
   },

   actionButton: {
      width: 40,
      height: 40,
   },
   speedDialActionOpen: {
      "& .MuiSpeedDialAction-staticTooltipLabel": {
         display: "block",
      },
   },
   dialButton: {
      display: "none",
   },
}
const VIEWER_VIDEO_CONTROLS_HINT_LOCAL_KEY = "hasSeenVideoControlsAsViewer"
interface Props {
   currentLivestream: LivestreamEvent
   streamerId: string
   viewer: boolean
   showSettings: boolean
   setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
   handleClickScreenShareButton: () => Promise<any>
   isMainStreamer: boolean
   localStreamIsPublished: {
      audio?: boolean
      video?: boolean
   }
   microphoneMuted: boolean
   cameraInactive: boolean
   joinAsViewer?: () => Promise<any>
   localMediaControls: {
      setLocalAudioEnabled: (enabled: boolean) => Promise<void>
      setLocalVideoEnabled: (enabled: boolean) => Promise<void>
   }
   openPublishingModal: () => void
}
type Action = {
   icon: JSX.Element
   name: string
   onClick: (event: any) => any
   disabled?: boolean
   loading?: boolean
   id?: string
}
const VideoControlsContainer = ({
   currentLivestream: { mode, screenSharerId, test },
   microphoneMuted,
   cameraInactive,
   viewer,
   setShowSettings,
   showSettings,
   streamerId,
   handleClickScreenShareButton,
   isMainStreamer,
   localStreamIsPublished,
   openPublishingModal,
   joinAsViewer,
   localMediaControls,
}: Props) => {
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const shareButtonRef = useRef()
   const streamRef = useStreamRef()
   const { tutorialSteps, setTutorialSteps } = useContext(TutorialContext)
   const theme = useTheme()
   const DELAY = 3000 //3 seconds
   const [shareVideoModalOpen, setShareVideoModalOpen] = useState(false)
   const [open, setOpen] = useState(true)
   const [openModal, setOpenModal] = useState(false)
   const [delayHandler, setDelayHandler] = useState(null)
   const [joiningAsViewer, setJoiningAsViewer] = useState(false)
   const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null)
   const [togglingMicrophone, setTogglingMicrophone] = useState(false)
   const [togglingCamera, setTogglingCamera] = useState(false)
   const [callToActionDrawerOpen, setCallToActionDrawerOpen] = useState(false)
   const [actions, setActions] = useState<Action[]>([])
   const [shareActions, setShareActions] = useState<Action[]>([])
   const [handRaiseState] = useHandRaiseState()

   const [fullyOpened, onEntered, onExited] = useSliderFullyOpened()
   const presentMode = mode === "presentation"
   const desktopMode = mode === "desktop"
   const videoMode = mode === "video"

   const showActionButtons = useSelector(showActionButtonsSelector)

   useEffect(() => {
      if (isOpen(16)) {
         setOpen(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [tutorialSteps])

   const handleOpenShareVideoModal = () => setShareVideoModalOpen(true)
   const handleCloseShareVideoModal = useCallback(
      () => setShareVideoModalOpen(false),
      []
   )
   const handleOpenShare = (shareButtonRef) => {
      setShareMenuAnchorEl(shareButtonRef.current)
   }

   const handleClickShare = (event) => {
      setShareMenuAnchorEl(event.currentTarget)
   }
   const handleCloseShareMenu = () => {
      setShareMenuAnchorEl(null)
   }

   const isOpen = (property) => {
      return Boolean(
         test && tutorialSteps.streamerReady && tutorialSteps[property]
      )
   }

   const handleConfirm = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      })
   }

   const handleMouseEnter = () => {
      clearTimeout(delayHandler)
      handleOpen()
   }

   const handleMouseLeave = () => {
      setDelayHandler(
         setTimeout(() => {
            handleClose()
         }, DELAY)
      )
   }

   const handleOpen = () => {
      setOpen(true)
   }

   const handleToggle = () => {
      setOpen(!open)
   }

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpenPublishingModal = () => {
      openPublishingModal()
   }

   const handleJoinAsViewer = async () => {
      try {
         setJoiningAsViewer(true)
         await joinAsViewer()
         setOpenModal(false)
      } catch (e) {
         dispatch(storeActions.sendGeneralError(e))
      }
      setJoiningAsViewer(false)
   }

   const toggleMicrophone = async () => {
      try {
         setTogglingMicrophone(true)
         await localMediaControls.setLocalAudioEnabled(microphoneMuted)
      } catch (e) {
         console.log("-> error in toggling microphone", e)
      }
      setTogglingMicrophone(false)
   }

   const toggleVideo = async () => {
      if (!localStreamIsPublished.video) {
         return openPublishingModal()
      }
      try {
         setTogglingCamera(true)
         await localMediaControls.setLocalVideoEnabled(cameraInactive)
      } catch (e) {
         console.log("-> error in toggling video", e)
      }
      setTogglingCamera(false)
   }

   function setLivestreamMode(mode) {
      firebase.setLivestreamMode(streamRef, mode)
   }

   const showScreenShareButtons = () => {
      if (desktopMode) {
         return isMainStreamer || streamerId === screenSharerId
      } else {
         if (viewer) return handRaiseState?.state === HandRaiseState.connected
         return true
      }
   }

   const handleOpenCallToActionDrawer = () => {
      setCallToActionDrawerOpen(true)
   }
   const handleCloseCallToActionDrawer = useCallback(() => {
      setCallToActionDrawerOpen(false)
   }, [])

   const isPublishing = useMemo(() => {
      return localStreamIsPublished.audio || localStreamIsPublished.video
   }, [localStreamIsPublished.audio, localStreamIsPublished.video])

   const localMicrophoneLabel = useMemo(() => {
      if (localStreamIsPublished.audio) {
         return microphoneMuted ? "Unmute microphone" : "Mute microphone"
      } else {
         return "Join with audio"
      }
   }, [localStreamIsPublished.audio, microphoneMuted])

   const localCameraLabel = useMemo(() => {
      if (localStreamIsPublished.video) {
         return cameraInactive ? "Switch camera on" : "Switch camera off"
      } else {
         return "Join with video"
      }
   }, [localStreamIsPublished.video, cameraInactive])

   useEffect(() => {
      const newActions: Action[] = []
      if (isPublishing) {
         newActions.unshift({
            icon: cameraInactive ? (
               <VideocamOffIcon fontSize="medium" style={{ color: "red" }} />
            ) : (
               <VideocamIcon fontSize="medium" color="primary" />
            ),
            name: localCameraLabel,
            onClick: toggleVideo,
            disabled: togglingCamera,
            loading: togglingCamera,
         })

         if (localStreamIsPublished.audio) {
            newActions.unshift({
               icon: microphoneMuted ? (
                  <MicOffIcon fontSize="medium" style={{ color: "red" }} />
               ) : (
                  <MicIcon fontSize="medium" color="primary" />
               ),
               name: localMicrophoneLabel,
               onClick: toggleMicrophone,
               disabled: togglingMicrophone,
               loading: togglingMicrophone,
            })
         }
      } else if (!viewer) {
         newActions.unshift({
            icon: <JoinAsStreamerIcon />,
            name: "Join as streamer",
            onClick: handleOpenPublishingModal,
         })
      }

      if (shareActions.length) {
         newActions.unshift({
            icon: <ShareIcon fontSize="small" />,
            name: "Share",
            onClick: handleClickShare,
         })
      }

      if (isPublishing) {
         newActions.unshift({
            icon: <SettingsIcon fontSize="medium" />,
            name: "Settings",
            onClick: () => setShowSettings(!showSettings),
         })
      }

      if (!viewer && isPublishing) {
         newActions.unshift({
            icon: <StudentViewIcon fontSize="medium" />,
            name: "Join as viewer",
            onClick: () => setOpenModal(true),
         })
      }
      setActions(newActions)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      isPublishing,
      togglingMicrophone,
      togglingCamera,
      localStreamIsPublished.audio,
      cameraInactive,
      microphoneMuted,
      localMicrophoneLabel,
      localCameraLabel,
      viewer,
      isPublishing,
      shareActions.length,
   ])

   const handleClickShareYoutubeVideo = useCallback(async () => {
      if (videoMode) {
         await firebase.stopSharingYoutubeVideo(streamRef)
      } else {
         handleOpenShareVideoModal()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [streamRef, videoMode])

   const shouldShowScreenShareButtons = showScreenShareButtons()

   useEffect(() => {
      const newShareActions: Action[] = []

      if (shouldShowScreenShareButtons) {
         newShareActions.unshift({
            icon: (
               <ScreenShareIcon color={desktopMode ? "primary" : "inherit"} />
            ),
            name: desktopMode ? "Stop sharing screen" : "Share screen",
            onClick: () => handleClickScreenShareButton(),
            id: "shareScreenAction",
         })
      }

      if (!viewer) {
         newShareActions.unshift(
            {
               icon: (
                  <SharePdfIcon color={presentMode ? "primary" : "inherit"} />
               ),
               name: presentMode
                  ? "Stop Sharing PDF presentation"
                  : "Share PDF presentation",
               onClick: () =>
                  setLivestreamMode(presentMode ? "default" : "presentation"),
               id: "sharePdfAction",
            },
            {
               icon: <YouTubeIcon color={videoMode ? "primary" : "inherit"} />,
               name: videoMode ? "Stop sharing video" : "Share video",
               onClick: handleClickShareYoutubeVideo,
               id: "shareYoutubeAction",
            },
            {
               icon: <CallToActionIcon />,
               name: "Send a call to action",
               onClick: () => handleOpenCallToActionDrawer(),
               id: "sendCtaAction",
            }
         )
      }

      setShareActions(newShareActions)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      shouldShowScreenShareButtons,
      desktopMode,
      handleClickScreenShareButton,
      viewer,
      presentMode,
      isMainStreamer,
      screenSharerId,
      streamerId,
      handRaiseState?.state,
      videoMode,
      streamRef,
   ])

   return (
      <div id={"streamControllerButtons"}>
         <ClickAwayListener onClickAway={handleClose}>
            <Box
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}
               sx={styles.root}
            >
               <NewFeatureHint
                  localStorageKey={VIEWER_VIDEO_CONTROLS_HINT_LOCAL_KEY}
                  tooltipTitle="Change your device settings"
                  hide={!viewer}
                  tooltipText="You can change device settings here as well as enable and disable your camera and microphone."
                  buttonText={"I understand"}
               >
                  <WhiteTooltip
                     placement="top"
                     style={{
                        transition: "transform 0.2s",
                        transitionTimingFunction:
                           theme.transitions.easing.easeInOut,
                        transform: open
                           ? ""
                           : "translate(20px, 0) scale3d(0.8, 0.8, 0.8)",
                     }}
                     title={
                        <React.Fragment>
                           <TooltipTitle>Video Controls</TooltipTitle>
                           <TooltipText>
                              You can mute, share slides, promote links and job
                              postings.
                           </TooltipText>
                           <TooltipButtonComponent
                              onConfirm={() => {
                                 handleOpen()
                                 handleConfirm(16)
                                 handleOpenShare(shareButtonRef)
                              }}
                              buttonText="Ok"
                           />
                        </React.Fragment>
                     }
                     open={isOpen(16) && fullyOpened}
                  >
                     <SpeedDial
                        ariaLabel="interaction-selector"
                        sx={[styles.speedDial, open && styles.speedDialOpen]}
                        FabProps={{
                           onClick: handleToggle,
                           sx: styles.dialButton,
                        }}
                        TransitionProps={{
                           // @ts-ignore
                           onEntered,
                           // @ts-ignore
                           onExited,
                        }}
                        icon={<SpeedDialIcon />}
                        onFocus={handleOpen}
                        open={showActionButtons}
                     >
                        {actions.map((action) => {
                           return (
                              <SpeedDialAction
                                 key={action.name}
                                 ref={
                                    action.name === "Share"
                                       ? shareButtonRef
                                       : undefined
                                 }
                                 icon={
                                    action.loading ? (
                                       <CircularProgress />
                                    ) : (
                                       action.icon
                                    )
                                 }
                                 tooltipPlacement="left"
                                 tooltipTitle={action.name}
                                 sx={[
                                    styles.speedDialAction,
                                    open && styles.speedDialActionOpen,
                                 ]}
                                 tooltipOpen={Boolean(action.name.length)}
                                 FabProps={{
                                    sx: [
                                       styles.actionButton,
                                       (action.loading || action.disabled) && {
                                          cursor: "pointer",
                                       },
                                    ],
                                    // @ts-ignore
                                    "data-testid": action.name,
                                    disabled: action.disabled,
                                 }}
                                 // eslint-disable-next-line react/jsx-handler-names
                                 onClick={action.onClick}
                              />
                           )
                        })}
                     </SpeedDial>
                  </WhiteTooltip>
               </NewFeatureHint>
               <ShareMenu
                  anchorEl={shareMenuAnchorEl}
                  onClose={handleCloseShareMenu}
                  isOpen={isOpen}
                  shareActions={shareActions}
                  handleOpenCallToActionDrawer={handleOpenCallToActionDrawer}
                  handleConfirm={handleConfirm}
               />
               <CallToActionDrawer
                  isOpen={isOpen}
                  isTestStream={test}
                  handleConfirm={handleConfirm}
                  onClose={handleCloseCallToActionDrawer}
                  open={callToActionDrawerOpen}
               />
            </Box>
         </ClickAwayListener>
         <Dialog open={openModal} onClose={() => setOpenModal(false)}>
            <DialogTitle>Joining as viewer</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure that you want to switch off your camera and
                  microphone? You can rejoin as a streamer at any time.
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button
                  variant="text"
                  color="grey"
                  disabled={joiningAsViewer}
                  onClick={() => setOpenModal(false)}
               >
                  Cancel
               </Button>
               <LoadingButton
                  startIcon={<CheckIcon />}
                  variant="contained"
                  color="primary"
                  loading={joiningAsViewer}
                  onClick={() => handleJoinAsViewer()}
               >
                  {joiningAsViewer ? "Joining" : "Confirm"}
               </LoadingButton>
            </DialogActions>
         </Dialog>
         {Boolean(shareVideoModalOpen) && (
            <ShareYoutubeVideoModal
               open={shareVideoModalOpen}
               onClose={handleCloseShareVideoModal}
            />
         )}
      </div>
   )
}

export default memo(VideoControlsContainer)
