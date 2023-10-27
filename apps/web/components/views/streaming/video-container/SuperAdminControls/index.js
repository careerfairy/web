import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { useAuth } from "HOCs/AuthProvider"
import {
   CircularProgress,
   SpeedDial,
   SpeedDialAction,
   Tooltip,
   Typography,
   useMediaQuery,
} from "@mui/material"
import SpyIcon from "@mui/icons-material/Visibility"
import RecordIcon from "@mui/icons-material/FiberManualRecord"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { useCurrentStream } from "context/stream/StreamContext"
import ConfirmRecordingDialog from "../../../admin/streams/StreamsContainer/StreamCard/ConfirmRecordingDialog"
import StopRecordingIcon from "@mui/icons-material/Stop"
import StartRecordingIcon from "@mui/icons-material/PlayCircleFilledWhite"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import SettingsIcon from "@mui/icons-material/Settings"
import Box from "@mui/material/Box"
import ConfirmStartStreamingDialog from "./ConfirmStartStreamingDialog"
import JoinAsStreamerIcon from "@mui/icons-material/RecordVoiceOver"
import useStreamToken from "../../../../custom-hook/useStreamToken"
import clsx from "clsx"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { focusModeEnabledSelector } from "../../../../../store/selectors/streamSelectors"

const useStyles = makeStyles((theme) => ({
   root: {
      position: "absolute",
      right: theme.spacing(2),
      top: theme.spacing(2),
      alignItems: "flex-end",
   },
   displaced: {
      top: 65,
   },
   tooltip: {
      whiteSpace: "nowrap",
   },
   overlayRoot: {
      position: "absolute",
      top: "30%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1,
      opacity: 0.7,
      color: theme.palette.primary.main,
   },
   overlayText: {
      fontWeight: 900,
   },
   expandIcon: {
      transition: theme.transitions.create(["transform"], {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
      marginLeft: 5,
   },
   rotated: {
      transform: `rotate(180deg)`,
   },
}))

const SpyingOverlay = () => {
   const classes = useStyles()
   return (
      <Box className={classes.overlayRoot}>
         <Typography className={classes.overlayText} variant="h1">
            CURRENTLY SPYING!
         </Typography>
      </Box>
   )
}

const SuperAdminControls = () => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))
   const { joiningStreamerLink, viewerLink } = useStreamToken()

   const { userData } = useAuth()
   const streamRef = useStreamRef()
   const { currentLivestream, isStreamer, isBreakout } = useCurrentStream()
   const {
      query: { spy, livestreamId, breakoutRoomId },
   } = useRouter()
   const [open, setOpen] = useState(false)
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const [streamStateChanging, setStreamStateChanging] = useState(false)

   const spyModeEnabled = useSelector(
      (state) => state.stream.streaming.spyModeEnabled
   )
   const recordingRequestOngoing = useSelector(
      (state) => state.streamAdmin.recording.recordingRequestOngoing
   )
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const [confirmRecordingDialogOpen, setConfirmRecordingDialogOpen] =
      useState(false)
   const [confirmStartStreamingDialogOpen, setConfirmStartStreamingDialogOpen] =
      useState(false)

   useEffect(() => {
      if (spy === "true" && userData?.isAdmin && !isStreamer) {
         dispatch(actions.setSpyMode(true))
         setOpen(true)
      }
   }, [spy, dispatch.userData?.isAdmin, isStreamer])

   const classes = useStyles()

   const handleStartRecording = async () => {
      if (isBreakout && breakoutRoomId) {
         dispatch(
            actions.handleStartRecording({
               firebase,
               streamId: livestreamId,
               isBreakout,
               breakoutRoomId,
            })
         )
      } else {
         dispatch(
            actions.handleStartRecording({
               firebase,
               streamId: currentLivestream?.id,
            })
         )
      }
   }

   const toggleStreamStarted = useCallback(async () => {
      try {
         setStreamStateChanging(true)
         await firebase.setLivestreamHasStarted(
            Boolean(!currentLivestream?.hasStarted),
            streamRef
         )
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setStreamStateChanging(false)
   }, [currentLivestream?.hasStarted])

   const handleStopRecording = async () => {
      if (isBreakout && breakoutRoomId) {
         dispatch(
            actions.handleStopRecording({
               firebase,
               streamId: livestreamId,
               isBreakout,
               breakoutRoomId,
            })
         )
      } else {
         dispatch(
            actions.handleStopRecording({
               firebase,
               streamId: currentLivestream?.id,
            })
         )
      }
   }

   const handleOpenConfirmRecordingDialog = () => {
      setConfirmRecordingDialogOpen(true)
   }
   const handleCloseConfirmRecordingDialog = () => {
      setConfirmRecordingDialogOpen(false)
   }
   const handleOpenConfirmStartStreamingDialog = () => {
      setConfirmStartStreamingDialogOpen(true)
   }
   const handleCloseConfirmStartStreamingDialog = () => {
      setConfirmStartStreamingDialogOpen(false)
   }

   const toggle = () => {
      setOpen(!open)
   }

   const close = () => {
      setOpen(false)
   }

   const handleJoinAsViewer = async () => {
      window?.open(viewerLink, "_self")
   }
   const handleJoinAsStreamer = async () => {
      window?.open(joiningStreamerLink, "_self")
   }

   const superAdminActions = useMemo(
      () =>
         [
            {
               icon: <JoinAsStreamerIcon color={"action"} />,
               name: "Join as Streamer",
               onClick: handleJoinAsStreamer,
               hidden: isStreamer,
            },
            {
               icon: <JoinAsStreamerIcon color={"action"} />,
               name: "Join as Viewer",
               onClick: handleJoinAsViewer,
               hidden: !isStreamer,
            },
            {
               icon: (
                  <RecordIcon
                     color={currentLivestream?.isRecording ? "error" : "action"}
                  />
               ),
               name: currentLivestream?.isRecording
                  ? "Stop Recording"
                  : "Start Recording",
               onClick: handleOpenConfirmRecordingDialog,
               disabled: recordingRequestOngoing,
               loading: recordingRequestOngoing,
               active: currentLivestream?.isRecording,
               hidden: currentLivestream?.test,
            },
            {
               icon: <SpyIcon color={spyModeEnabled ? "primary" : "action"} />,
               name: spyModeEnabled ? "Disable SpyMode" : "Enable SpyMode",
               onClick: () => dispatch(actions.setSpyMode()),
               active: spyModeEnabled,
               hidden: isStreamer,
            },
            {
               icon: currentLivestream?.hasStarted ? (
                  <StopRecordingIcon color="error" />
               ) : (
                  <StartRecordingIcon color="primary" />
               ),
               name: currentLivestream?.hasStarted
                  ? "Stop Stream"
                  : "Start Stream",
               onClick: handleOpenConfirmStartStreamingDialog,
               active: currentLivestream?.hasStarted,
               loading: streamStateChanging,
               disabled: streamStateChanging,
            },
         ].filter((action) => !action.hidden),
      [
         spyModeEnabled,
         dispatch,
         recordingRequestOngoing,
         currentLivestream?.isRecording,
         currentLivestream?.hasStarted,
         currentLivestream?.test,
         currentLivestream?.id,
         confirmRecordingDialogOpen,
         isStreamer,
         streamStateChanging,
         toggleStreamStarted,
         streamRef,
         viewerLink,
         joiningStreamerLink,
         isBreakout,
         mobile,
      ]
   )

   if (!userData?.isAdmin) {
      return
   }

   return (
      <>
         <SpeedDial
            ariaLabel="Admin Stream Controls"
            className={clsx(classes.root, {
               [classes.displaced]: focusModeEnabled || mobile,
            })}
            direction="down"
            icon={
               mobile ? (
                  <Tooltip
                     title={
                        open ? "Hide Admin Controls" : "Show Admin Controls"
                     }
                  >
                     {open ? (
                        <ExpandMoreIcon className={classes.rotated} />
                     ) : (
                        <ExpandMoreIcon />
                     )}
                  </Tooltip>
               ) : (
                  <>
                     <SettingsIcon style={{ marginRight: 5 }} />
                     {open ? "Hide Admin Controls" : "Show Admin Controls"}
                     <ExpandMoreIcon
                        className={clsx(classes.expandIcon, {
                           [classes.rotated]: open,
                        })}
                     />
                  </>
               )
            }
            FabProps={{
               color: "secondary",
               onClick: toggle,
               variant: !mobile && "extended",
               size: mobile ? "small" : "medium",
            }}
            open={open}
         >
            {superAdminActions.map((action) => (
               <SpeedDialAction
                  key={action.name}
                  icon={action.loading ? <CircularProgress /> : action.icon}
                  tooltipTitle={action.name}
                  classes={{ staticTooltipLabel: classes.tooltip }}
                  FabProps={{
                     disabled: action.disabled,
                     color: action.active ? "primary" : "secondary",
                  }}
                  tooltipOpen
                  onClick={action.onClick}
               />
            ))}
         </SpeedDial>
         {currentLivestream?.isRecording ? (
            <ConfirmRecordingDialog
               confirmText="Are you sure that you want to stop recording this live stream?"
               onConfirm={handleStopRecording}
               open={confirmRecordingDialogOpen}
               disabled={recordingRequestOngoing}
               onclose={handleCloseConfirmRecordingDialog}
            />
         ) : (
            <ConfirmRecordingDialog
               confirmText="Are you sure that you want to start recording this live stream?"
               onConfirm={handleStartRecording}
               open={confirmRecordingDialogOpen}
               disabled={recordingRequestOngoing}
               onclose={handleCloseConfirmRecordingDialog}
            />
         )}
         {spyModeEnabled && <SpyingOverlay />}
         <ConfirmStartStreamingDialog
            open={confirmStartStreamingDialogOpen}
            onClose={handleCloseConfirmStartStreamingDialog}
            onConfirm={toggleStreamStarted}
            confirmDescription={
               currentLivestream?.hasStarted
                  ? "Are you sure that you want to end your live stream now?"
                  : "Are you sure that you want to start your live stream now?"
            }
         />
      </>
   )
}

export default SuperAdminControls
