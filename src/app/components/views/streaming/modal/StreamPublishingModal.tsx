import React, { memo, useEffect, useMemo, useRef, useState } from "react";
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
import SoundLevelDisplay from "components/views/common/SoundLevelDisplay";
import ButtonWithConfirm from "components/views/common/ButtonWithConfirm";
import { useDispatch, useSelector } from "react-redux";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import LoadingButton from "@mui/lab/LoadingButton";
import * as actions from "store/actions";
import useLocalStorageMediaSources from "components/custom-hook/useLocalStorageMediaSources";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
   DeviceList,
   LocalMediaHandlers,
   LocalStream,
   MediaControls,
} from "types/streaming";
import { Theme } from "@mui/system";
import RootState from "store/reducers";

const styles = {
   actions: {},
   button: {
      height: "100%",
   },
   container: {
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
      color: (theme: Theme) => theme.palette.grey[300],
   },
   gridItemContent: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
   },
   deviceDeniedWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
   },
   videoBox: {
      boxShadow: "0 0 3px rgb(200,200,200)",
      borderRadius: "5px",
      width: "100%",
      height: 150,
      background: "black",
      color: "white",
      display: "grid",
      placeItems: "center",
   },
} as const;

interface Props {
   devices: DeviceList;
   displayableMediaStream: MediaStream;
   labels: {
      mainTitle: string;
      refuseTooltip: string;
      refuseLabel: string;
      joinWithoutCameraLabel: string;
      joinWithoutCameraTooltip: string;
      joinButtonLabel: string;
      disabledJoinButtonLabel: string;
      joinWithoutCameraConfirmDescription: string;
   };
   localMediaHandlers: LocalMediaHandlers;
   localStream: LocalStream;
   mediaControls: MediaControls;
   showSoundMeter: boolean;
   open: boolean;
   onRefuseStream: () => Promise<any>;
   onConfirmStream: () => Promise<any>;
}
const StreamPublishingModal = memo(
   ({
      devices,
      displayableMediaStream,
      labels,
      localMediaHandlers,
      localStream,
      mediaControls,
      onConfirmStream,
      onRefuseStream,
      open,
      showSoundMeter,
   }: Props) => {
      const noCameras = Boolean(!devices.videoDeviceList.length);
      const noMicrophones = Boolean(!devices.audioInputList.length);
      const [activatingCamera, setActivatingCamera] = useState(false);
      const [activatingMic, setActivatingMic] = useState(false);
      const [publishingStream, setPublishingStream] = useState(false);
      const { storeNewMediaSources } = useLocalStorageMediaSources();
      const testVideoRef = useRef(null);
      const dispatch = useDispatch();

      const agoraRtcConnectionState = useSelector((state: RootState) => {
         return state.stream.agoraState.rtcConnectionState;
      });
      const cameraDenied = useSelector((state: RootState) => {
         return state.stream.agoraState.deviceErrors.cameraDenied;
      });
      const micDenied = useSelector((state: RootState) => {
         return state.stream.agoraState.deviceErrors.microphoneDenied;
      });
      const micInUseByAnotherApp = useSelector((state: RootState) => {
         return state.stream.agoraState.deviceErrors.microphoneIsUsedByOtherApp;
      });
      const camInUseByAnotherApp = useSelector((state: RootState) => {
         return state.stream.agoraState.deviceErrors.cameraIsUsedByOtherApp;
      });

      const openModal = useMemo(() => {
         return open && agoraRtcConnectionState.curState === "CONNECTED";
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
         (async function initializeMediaDevices() {
            if (openModal) {
               const hasEnabledCamera =
                  localStorage.getItem("hasEnabledCamera") === "true";
               const hasEnabledMic =
                  localStorage.getItem("hasEnabledMicrophone") === "true";
               if (hasEnabledCamera && hasEnabledMic) {
                  return await localMediaHandlers.initializeVideoCameraAudioTrack();
               }
               if (hasEnabledCamera) {
                  return await localMediaHandlers.initializeLocalVideoStream();
               }
               if (hasEnabledMic) {
                  return await localMediaHandlers.initializeLocalAudioStream();
               }
            } else return;
         })();
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
            await localMediaHandlers.initializeLocalVideoStream();
            localStorage.setItem("hasEnabledCamera", "true");
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setActivatingCamera(false);
      };

      const handleCloseCamera = async () => {
         await localMediaHandlers.closeLocalCameraTrack();
         localStorage.setItem("hasEnabledCamera", "false");
      };

      const handleInitializeMic = async () => {
         try {
            setActivatingMic(true);
            await localMediaHandlers.initializeLocalAudioStream();
            localStorage.setItem("hasEnabledMicrophone", "true");
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setActivatingMic(false);
      };
      const handleCloseMic = async () => {
         await localMediaHandlers.closeLocalMicrophoneTrack();
         localStorage.setItem("hasEnabledMicrophone", "false");
      };

      const handleChangeCam = async (event) => {
         await mediaControls.updateVideoSource(event.target.value);
      };

      const handleChangeMic = async (event) => {
         await mediaControls.updateAudioSource(event.target.value);
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
      }, [hasAudioTrack, hasVideoTrack, labels.joinButtonLabel]);

      const activateCameraButtonLabel = useMemo(() => {
         if (noCameras) {
            if (cameraDenied) {
               return "Camera Access Is Not Authorized";
            }
            return "No Camera Detected";
         }
         if (camInUseByAnotherApp) {
            return "This camera is currently being used by another app";
         }
         return "Activate Camera";
      }, [noMicrophones, cameraDenied, camInUseByAnotherApp]);

      const activateMicButtonLabel = useMemo(() => {
         if (noMicrophones) {
            if (micDenied) {
               return "Microphone Access Is Not Authorized";
            }
            return "No Microphone Detected";
         }
         return "Activate Microphone";
      }, [noMicrophones, micDenied]);

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
                              {camInUseByAnotherApp ? (
                                 <Box sx={styles.videoBox}>
                                    <Typography align="center" variant="body1">
                                       This device is currently being used by
                                       another app
                                    </Typography>
                                 </Box>
                              ) : (
                                 <Box
                                    sx={styles.videoBox}
                                    component="video"
                                    ref={testVideoRef}
                                    muted={true}
                                    autoPlay
                                 />
                              )}
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
                                 disabled={
                                    noCameras ||
                                    cameraDenied ||
                                    camInUseByAnotherApp
                                 }
                                 onClick={handleInitializeCamera}
                                 startIcon={<VideocamIcon />}
                              >
                                 {activateCameraButtonLabel}
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
                                 {showSoundMeter && (
                                    <SoundLevelDisplay
                                       localStream={localStream}
                                       showSoundMeter={showSoundMeter}
                                    />
                                 )}
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
                                 disabled={noMicrophones || micDenied}
                                 onClick={handleInitializeMic}
                                 startIcon={<MicIcon />}
                              >
                                 {activateMicButtonLabel}
                              </LoadingButton>
                           </Box>
                        )}
                     </Box>
                  </Grid>
                  {(micDenied || cameraDenied) && (
                     <Box sx={styles.deviceDeniedWrapper}>
                        <Typography variant="body1" align="center" gutterBottom>
                           Please allow access to your webcam and your
                           microphone.
                        </Typography>
                        <Button
                           endIcon={<OpenInNewIcon />}
                           href={
                              "https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DDesktop#zippy=%2Cturn-on-permissions-in-computer-settings"
                           }
                           target="_blank"
                           color="grey"
                           variant="text"
                           size="small"
                        >
                           Learn how to authorize access
                        </Button>
                     </Box>
                  )}
               </Grid>
            </DialogContent>
            <DialogActions>
               <Tooltip title={labels.refuseTooltip}>
                  <Button
                     color="grey"
                     children={labels.refuseLabel}
                     onClick={onRefuseStream}
                  />
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
                     mobile={undefined}
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
);

export default StreamPublishingModal;
