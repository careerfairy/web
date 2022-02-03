import React, { useEffect, useMemo, useRef, useState } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import {
   Box,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   Grid,
   IconButton,
   InputLabel,
   MenuItem,
   Select,
   Slide,
   Tooltip,
   Typography,
} from "@mui/material";
import SoundLevelDisplayer from "components/views/common/SoundLevelDisplayer";
import ButtonWithConfirm from "components/views/common/ButtonWithConfirm";
import { useDispatch, useSelector } from "react-redux";
import { AGORA_RTC_CONNECTION_STATE_CONNECTED } from "constants/agora";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import LoadingButton from "@mui/lab/LoadingButton";
import * as actions from "store/actions";
import useLocalStorageMediaSources from "../../../custom-hook/useLocalStorageMediaSources";
import { useEffectOnce } from "react-use";

const styles = {
   actions: {},
   button: {
      height: "100%",
   },
   container: {
      paddingTop: 1,
      paddingBottom: 3,
      textAlign: "center",
   },
   dialogTitle: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   iconWrapper: {
      mt: 1,
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
   },
   title: {
      textAlign: "center",
      marginBottom: 2,
      fontWeight: "700",
      fontSize: "0.9rem",
      color: (theme) => theme.palette.grey[300],
   },
   gridItemContent: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
   },
};

function StreamPublishingModal({
   displayableMediaStream,
   localStream,
   devices,
   mediaControls,
   open,
   onConfirmStream,
   onRefuseStream,
   localMediaEnabling,
   labels,
}) {
   const [activatingCamera, setActivatingCamera] = useState(false);
   const [activatingMic, setActivatingMic] = useState(false);
   const [publishingStream, setPublishingStream] = useState(false);
   const { storeNewMediaSources } = useLocalStorageMediaSources();

   const testVideoRef = useRef(null);
   const dispatch = useDispatch();

   const agoraRtcConnectionState = useSelector((state) => {
      return state.stream.agoraState.rtcConnectionState;
   });

   const openModal = useMemo(() => {
      return (
         open &&
         agoraRtcConnectionState === AGORA_RTC_CONNECTION_STATE_CONNECTED
      );
   }, [open, agoraRtcConnectionState]);

   useEffect(() => {
      if (
         openModal &&
         displayableMediaStream &&
         displayableMediaStream.getVideoTracks().length > 0 &&
         testVideoRef.current
      ) {
         testVideoRef.current.srcObject = displayableMediaStream;
      }
   }, [displayableMediaStream, openModal, testVideoRef.current]);

   useEffect(() => {
      if (openModal) {
         const initializeMediaDevices = async () => {
            if (localStorage.getItem("hasEnabledCamera") === "true") {
               await localMediaEnabling.initializeLocalVideoStream();
            }
            if (localStorage.getItem("hasEnabledMicrophone") === "true") {
               await localMediaEnabling.initializeLocalAudioStream();
            }
         };
         initializeMediaDevices();
      }
   }, [openModal]);
   const handleConfirmPublishStream = async () => {
      try {
         setPublishingStream(true);
         await onConfirmStream();
         storeNewMediaSources({
            audioSourceId: mediaControls.audioSource,
            videoSourceId: mediaControls.videoSource,
         });
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setPublishingStream(false);
   };

   const handleInitializeCamera = async () => {
      try {
         setActivatingCamera(true);
         await localMediaEnabling.initializeLocalVideoStream();
         localStorage.setItem("hasEnabledCamera", "true");
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setActivatingCamera(false);
   };

   const handleCloseCamera = () => {
      localMediaEnabling.closeLocalCameraTrack();
      localStorage.setItem("hasEnabledCamera", "false");
   };

   const handleInitializeMic = async () => {
      try {
         setActivatingMic(true);
         await localMediaEnabling.initializeLocalAudioStream();
         localStorage.setItem("hasEnabledMicrophone", "true");
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setActivatingMic(false);
   };
   const handleCloseMic = () => {
      localMediaEnabling.closeLocalMicrophoneTrack();
      localStorage.setItem("hasEnabledMicrophone", "false");
   };

   const handleChangeCam = (event) => {
      mediaControls.updateVideoSource(event.target.value);
   };

   const handleChangeMic = (event) => {
      mediaControls.updateAudioSource(event.target.value);
   };

   const hasAudioTrack = useMemo(() => {
      return Boolean(localStream) && Boolean(localStream.audioTrack);
   }, [localStream, localStream?.audioTrack]);

   const hasVideoTrack = useMemo(() => {
      return Boolean(localStream) && Boolean(localStream.videoTrack);
   }, [localStream, localStream?.videoTrack]);

   const joinButtonLabel = useMemo(() => {
      if (hasAudioTrack && hasVideoTrack) return labels.joinButtonLabel;
      if (!hasAudioTrack) return labels.disabledJoinButtonLabel;
      if (!hasVideoTrack) return labels.joinWithoutCameraLabel;
   }, [hasAudioTrack, hasVideoTrack]);

   return (
      <Dialog TransitionComponent={Slide} open={openModal} fullWidth>
         <DialogTitle disableTypography sx={styles.dialogTitle}>
            <PersonAddIcon sx={{ mr: 2 }} fontSize="medium" />
            <Typography
               style={{ fontSize: "1.2em", fontWeight: 500 }}
               variant="h5"
            >
               {labels.mainTitle}
            </Typography>
         </DialogTitle>
         <DialogContent dividers>
            <Grid container spacing={2}>
               <Grid item sx={styles.actions} lg={6} md={6} sm={6} xs={12}>
                  <Box sx={styles.gridItemContent}>
                     <Typography sx={styles.title}>WITH VIDEO</Typography>
                     {hasVideoTrack ? (
                        <>
                           <FormControl
                              disabled={!devices.videoDeviceList.length}
                              sx={{
                                 marginBottom: 2,
                                 fontSize: "0.8rem",
                                 width: "100%",
                                 maxHeight: 200,
                              }}
                              size="small"
                              variant="outlined"
                           >
                              <InputLabel id="camera-select-label">
                                 Select Camera
                              </InputLabel>
                              <Select
                                 labelId="camera-select-label"
                                 value={mediaControls.videoSource || ""}
                                 onChange={handleChangeCam}
                                 id="cameraSelect"
                                 label="Select Camera"
                              >
                                 <MenuItem value="" disabled>
                                    Select Camera
                                 </MenuItem>
                                 {devices.videoDeviceList.map((device) => {
                                    return (
                                       <MenuItem
                                          key={device.value}
                                          value={device.value}
                                       >
                                          {device.text}
                                       </MenuItem>
                                    );
                                 })}
                              </Select>
                           </FormControl>
                           <video
                              style={{
                                 boxShadow: "0 0 3px rgb(200,200,200)",
                                 borderRadius: "5px",
                                 width: "100%",
                                 height: 150,
                                 background: "black",
                              }}
                              ref={testVideoRef}
                              muted={true}
                              autoPlay
                           />
                           <Box sx={styles.iconWrapper}>
                              <IconButton
                                 aria-label="turn-off-video-icon"
                                 size="medium"
                                 onClick={handleCloseCamera}
                              >
                                 <VideocamOffIcon fontSize="inherit" />
                              </IconButton>
                           </Box>
                        </>
                     ) : (
                        <Box sx={styles.container}>
                           <LoadingButton
                              variant="contained"
                              loading={activatingCamera}
                              onClick={handleInitializeCamera}
                              startIcon={<VideocamIcon />}
                           >
                              Activate Camera
                           </LoadingButton>
                        </Box>
                     )}
                  </Box>
               </Grid>
               <Grid item lg={6} md={6} sm={6} xs={12}>
                  <Box sx={styles.gridItemContent}>
                     <Typography sx={styles.title}>WITH AUDIO</Typography>
                     {hasAudioTrack ? (
                        <>
                           <FormControl
                              sx={{ marginBottom: 2 }}
                              disabled={!devices.audioInputList.length}
                              fullWidth
                              variant="outlined"
                              size="small"
                           >
                              <InputLabel id="microphone-select-label">
                                 Select Microphone
                              </InputLabel>
                              <Select
                                 value={mediaControls.audioSource || ""}
                                 fullWidth
                                 labelId="microphone-select-label"
                                 onChange={handleChangeMic}
                                 id="microphoneSelect"
                                 label="Select Microphone"
                              >
                                 <MenuItem value="" disabled>
                                    Select a Microphone
                                 </MenuItem>
                                 {devices.audioInputList.map((device) => {
                                    return (
                                       <MenuItem
                                          key={device.value}
                                          value={device.value}
                                       >
                                          {device.text}
                                       </MenuItem>
                                    );
                                 })}
                              </Select>
                           </FormControl>
                           <Box
                              sx={{
                                 flex: 1,
                              }}
                           >
                              <SoundLevelDisplayer
                                 audioLevel={mediaControls.audioLevel}
                              />
                           </Box>
                           <Box sx={styles.iconWrapper}>
                              <IconButton
                                 aria-label="microphone-off-icon"
                                 size="medium"
                                 onClick={handleCloseMic}
                              >
                                 <MicOffIcon fontSize="inherit" />
                              </IconButton>
                           </Box>
                        </>
                     ) : (
                        <Box sx={styles.container}>
                           <LoadingButton
                              variant="contained"
                              loading={activatingMic}
                              onClick={handleInitializeMic}
                              startIcon={<MicIcon />}
                           >
                              Activate Microphone
                           </LoadingButton>
                        </Box>
                     )}
                  </Box>
               </Grid>
            </Grid>
         </DialogContent>
         <DialogActions>
            <Tooltip title={labels.refuseTooltip}>
               <Button children={labels.refuseLabel} onClick={onRefuseStream} />
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
               />
            ) : (
               <LoadingButton
                  children={joinButtonLabel}
                  loading={publishingStream}
                  variant="contained"
                  color="primary"
                  disabled={!hasAudioTrack}
                  startIcon={hasAudioTrack && <CheckIcon />}
                  onClick={handleConfirmPublishStream}
               />
            )}
         </DialogActions>
      </Dialog>
   );
}

export default StreamPublishingModal;
