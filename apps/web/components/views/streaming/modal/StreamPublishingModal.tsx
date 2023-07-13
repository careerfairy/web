import React, { memo, useCallback, useMemo, useState } from "react"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import CheckIcon from "@mui/icons-material/Check"
import {
   Alert,
   AlertTitle,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grid,
   Slide,
   Tooltip,
   Typography,
} from "@mui/material"
import ButtonWithConfirm from "components/views/common/ButtonWithConfirm"
import { useDispatch, useSelector } from "react-redux"
import LoadingButton from "@mui/lab/LoadingButton"
import * as actions from "store/actions"
import useLocalStorageMediaSources from "components/custom-hook/useLocalStorageMediaSources"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"

import {
   DeviceList,
   LocalMediaHandlers,
   LocalStream,
   MediaControls,
} from "types/streaming"
import { RootState } from "store"
import DeviceSelect from "../sharedComponents/DeviceSelect"
import { rtcConnectionStateSelector } from "../../../../store/selectors/streamSelectors"
import { useMountedState } from "react-use"

const styles = {
   dialogTitle: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   deviceDeniedWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
   },
} as const

interface Props {
   devices: DeviceList
   displayableMediaStream: MediaStream
   labels: {
      mainTitle: string
      refuseTooltip: string
      refuseLabel: string
      joinWithoutCameraLabel: string
      joinWithoutCameraTooltip: string
      joinButtonLabel: string
      disabledJoinButtonLabel: string
      joinWithoutCameraConfirmDescription: string
   }
   localMediaHandlers: LocalMediaHandlers
   localStream: LocalStream
   mediaControls: MediaControls
   showSoundMeter: boolean
   onRefuseStream: () => Promise<any>
   onConfirmStream: () => Promise<any>
   deviceInitializers: {
      initializeCameras: () => Promise<any>
      initializeMicrophones: () => Promise<any>
   }
}
const StreamPublishingModal = ({
   devices,
   displayableMediaStream,
   labels,
   localMediaHandlers,
   localStream,
   mediaControls,
   onConfirmStream,
   onRefuseStream,
   showSoundMeter,
   deviceInitializers,
}: Props) => {
   const [publishingStream, setPublishingStream] = useState(false)
   const { storeNewMediaSources } = useLocalStorageMediaSources()
   const isMounted = useMountedState()
   const dispatch = useDispatch()

   const agoraRtcConnectionState = useSelector(rtcConnectionStateSelector)
   const cameraDenied = useSelector((state: RootState) => {
      return state.stream.agoraState.deviceErrors.cameraDenied
   })
   const micDenied = useSelector((state: RootState) => {
      return state.stream.agoraState.deviceErrors.microphoneDenied
   })

   const openModal = useMemo(() => {
      return agoraRtcConnectionState.curState === "CONNECTED"
   }, [agoraRtcConnectionState])

   const handleConfirmPublishStream = useCallback(async () => {
      try {
         setPublishingStream(true)
         await onConfirmStream()
         storeNewMediaSources({
            audioSourceId: mediaControls.audioSource,
            videoSourceId: mediaControls.videoSource,
         })
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      if (isMounted()) {
         setPublishingStream(false)
      }
   }, [
      dispatch,
      mediaControls.audioSource,
      mediaControls.videoSource,
      onConfirmStream,
      storeNewMediaSources,
      isMounted,
   ])

   const hasAudioTrack = useMemo(() => {
      return Boolean(localStream) && Boolean(localStream.audioTrack)
   }, [localStream, localStream?.audioTrack])

   const hasVideoTrack = useMemo(() => {
      return Boolean(localStream) && Boolean(localStream.videoTrack)
   }, [localStream, localStream?.videoTrack])

   const joinButtonLabel = useMemo(() => {
      if (hasAudioTrack && hasVideoTrack) return labels.joinButtonLabel
      if (!hasAudioTrack) return labels.disabledJoinButtonLabel
      if (!hasVideoTrack) return labels.joinWithoutCameraLabel
   }, [hasAudioTrack, hasVideoTrack, labels.joinButtonLabel])

   return (
      <Dialog TransitionComponent={Slide} open={openModal} fullWidth>
         <DialogTitle sx={styles.dialogTitle}>
            <PersonAddIcon sx={{ mr: 2 }} fontSize="medium" />
            <Typography style={{ fontSize: "1.2em", fontWeight: 500 }}>
               {labels.mainTitle}
            </Typography>
         </DialogTitle>
         <DialogContent dividers>
            <Grid container spacing={2}>
               <Grid item lg={6} md={6} sm={6} xs={12}>
                  <DeviceSelect
                     devices={devices}
                     localStream={localStream}
                     showSoundMeter={showSoundMeter}
                     displayableMediaStream={displayableMediaStream}
                     localMediaHandlers={localMediaHandlers}
                     openModal={openModal}
                     showDisableIcon
                     deviceInitializers={deviceInitializers}
                     mediaControls={mediaControls}
                     mediaDeviceType={"camera"}
                     selectTitle={"Select Camera"}
                     title={"Select Camera"}
                  />
               </Grid>
               <Grid item lg={6} md={6} sm={6} xs={12}>
                  <DeviceSelect
                     devices={devices}
                     localStream={localStream}
                     showSoundMeter={showSoundMeter}
                     deviceInitializers={deviceInitializers}
                     displayableMediaStream={displayableMediaStream}
                     localMediaHandlers={localMediaHandlers}
                     openModal={openModal}
                     mediaControls={mediaControls}
                     showDisableIcon
                     mediaDeviceType={"microphone"}
                     selectTitle={"Select Microphone"}
                     title={"Select Microphone"}
                  />
               </Grid>
               {(micDenied || cameraDenied) && (
                  <Grid item xs={12}>
                     <Alert severity="warning">
                        <AlertTitle>Device Permissions Denied</AlertTitle>
                        Please allow access to your webcam and/or your
                        microphone.
                        <Button
                           sx={{ m1: 1, mx: "auto" }}
                           endIcon={<OpenInNewIcon />}
                           href={
                              "https://support.careerfairy.io/en/article/camera-and-microphone-issues-1oxpag9/"
                           }
                           target="_blank"
                           color="grey"
                           variant="text"
                           size="small"
                        >
                           Learn how to authorize access
                        </Button>
                     </Alert>
                  </Grid>
               )}
            </Grid>
         </DialogContent>
         <DialogActions>
            <Tooltip title={labels.refuseTooltip}>
               <Button color="grey" onClick={onRefuseStream}>
                  {labels.refuseLabel}
               </Button>
            </Tooltip>
            {!hasVideoTrack && hasAudioTrack ? (
               <ButtonWithConfirm
                  buttonLabel={joinButtonLabel}
                  variant="contained"
                  color="primary"
                  disabled={publishingStream}
                  startIcon={
                     publishingStream ? (
                        <CircularProgress color="inherit" size={20} />
                     ) : (
                        <CheckIcon />
                     )
                  }
                  tooltipTitle={labels.joinWithoutCameraTooltip}
                  buttonAction={handleConfirmPublishStream}
                  confirmDescription={
                     labels.joinWithoutCameraConfirmDescription
                  }
                  hasStarted={false}
               />
            ) : (
               <LoadingButton
                  loading={publishingStream}
                  variant="contained"
                  color="primary"
                  disabled={!hasAudioTrack}
                  startIcon={hasAudioTrack && <CheckIcon />}
                  onClick={handleConfirmPublishStream}
               >
                  {joinButtonLabel}
               </LoadingButton>
            )}
         </DialogActions>
      </Dialog>
   )
}

export default memo(StreamPublishingModal)
