import React, { useEffect, useMemo, useRef, useState } from "react";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CheckIcon from "@material-ui/icons/Check";
import {
   DialogTitle,
   Typography,
   Slide,
   DialogContent as MuiDialogContent,
   DialogActions as MuiDialogActions,
   Dialog,
   Button,
   FormControl,
   InputLabel,
   Select,
   OutlinedInput,
   Grid,
   MenuItem,
   Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SoundLevelDisplayer from "components/views/common/SoundLevelDisplayer";
import ButtonWithConfirm from "components/views/common/ButtonWithConfirm";
import { useSelector } from "react-redux";
import { AGORA_RTC_CONNECTION_STATE_CONNECTED } from "constants/agora";
import VideocamIcon from "@material-ui/icons/Videocam";
import MicIcon from "@material-ui/icons/Mic";
import IconButton from "@material-ui/core/IconButton";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";

const useStyles = makeStyles((theme) => ({
   actions: {},
   button: {
      height: "100%",
   },
   container: {
      paddingTop: 10,
      paddingBottom: 30,
      textAlign: "center",
   },
   title: {
      textAlign: "center",
      marginBottom: 20,
      fontWeight: "700",
      fontSize: "0.9rem",
      color: "rgb(200,200,200)",
   },
}));

function StreamPublishingModal({
   displayableMediaStream,
   localStream,
   devices,
   mediaControls,
   open,
   onConfirmStream,
   onRefuseStream,
   localMediaEnabling,
}) {
   const testVideoRef = useRef(null);
   const inputLabel = useRef(null);
   const [labelWidth, setLabelWidth] = useState(0);

   const classes = useStyles();

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
      if (inputLabel?.cursrent?.offsetWidth) {
         setLabelWidth(inputLabel?.current.offsetWidth);
      }
   }, []);

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

   const handleInitializeCamera = async () => {
      await localMediaEnabling.initializeLocalVideoStream();
      localStorage.setItem("hasEnabledCamera", "true");
   };

   const handleCloseCamera = () => {
      localMediaEnabling.closeLocalCameraTrack();
      localStorage.setItem("hasEnabledCamera", "false");
   };

   const handleInitializeMic = async () => {
      await localMediaEnabling.initializeLocalAudioStream();
      localStorage.setItem("hasEnabledMicrophone", "true");
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
   }, [localStream, localStream.audioTrack]);

   const hasVideoTrack = useMemo(() => {
      return Boolean(localStream) && Boolean(localStream.videoTrack);
   }, [localStream, localStream.videoTrack]);

   const joinButtonLabel = useMemo(() => {
      if (hasAudioTrack && hasVideoTrack) return "Join as streamer";
      if (!hasAudioTrack) return "Activate microphone to join";
      if (!hasVideoTrack) return "Join without camera";
   }, [hasAudioTrack, hasVideoTrack]);

   return (
      <Dialog TransitionComponent={Slide} open={openModal} fullWidth>
         <DialogTitle
            disableTypography
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "flex-end",
            }}
            align="center"
         >
            <PersonAddIcon
               style={{ marginRight: "0.5rem" }}
               fontSize="medium"
            />{" "}
            <Typography
               style={{ fontSize: "1.2em", fontWeight: 500 }}
               variant="h5"
            >
               Join the Stream
            </Typography>
         </DialogTitle>
         <MuiDialogContent dividers>
            <Grid container spacing={2}>
               <Grid
                  item
                  className={classes.actions}
                  lg={6}
                  md={6}
                  sm={6}
                  xs={12}
               >
                  <Typography className={classes.title}>WITH VIDEO</Typography>
                  {hasVideoTrack ? (
                     <>
                        <FormControl
                           disabled={!devices.videoDeviceList.length}
                           style={{
                              marginBottom: 20,
                              fontSize: "0.8rem",
                              width: "100%",
                              maxHeight: 200,
                           }}
                           size="small"
                           variant="outlined"
                        >
                           <InputLabel
                              shrink
                              ref={inputLabel}
                              htmlFor="cameraSelect"
                           >
                              Select Camera
                           </InputLabel>
                           <Select
                              value={mediaControls.videoSource || ""}
                              onChange={handleChangeCam}
                              variant="outlined"
                              id="cameraSelect"
                              input={
                                 <OutlinedInput
                                    notched
                                    labelWidth={labelWidth}
                                    name="camera"
                                    id="cameraSelect"
                                 />
                              }
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
                        <div style={{ textAlign: "center" }}>
                           <IconButton
                              aria-label="delete"
                              size="medium"
                              onClick={handleCloseCamera}
                           >
                              <VideocamOffIcon fontSize="inherit" />
                           </IconButton>
                        </div>
                     </>
                  ) : (
                     <div className={classes.container}>
                        <Button
                           variant="contained"
                           onClick={handleInitializeCamera}
                           startIcon={<VideocamIcon />}
                        >
                           Activate Camera
                        </Button>
                     </div>
                  )}
               </Grid>
               <Grid item lg={6} md={6} sm={6} xs={12}>
                  <Typography className={classes.title}>WITH AUDIO</Typography>
                  {hasAudioTrack ? (
                     <>
                        <FormControl
                           style={{ marginBottom: 10 }}
                           disabled={!devices.audioInputList.length}
                           fullWidth
                           variant="outlined"
                           size="small"
                        >
                           <InputLabel id="microphoneSelect">
                              Select Microphone
                           </InputLabel>
                           <Select
                              value={mediaControls.audioSource || ""}
                              fullWidth
                              onChange={handleChangeMic}
                              variant="outlined"
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
                        <div
                           style={{
                              width: "100%",
                              height: 150,
                           }}
                        >
                           <SoundLevelDisplayer
                              audioLevel={mediaControls.audioLevel}
                           />
                        </div>
                        <div style={{ textAlign: "center" }}>
                           <IconButton
                              aria-label="delete"
                              size="medium"
                              onClick={handleCloseMic}
                           >
                              <MicOffIcon fontSize="inherit" />
                           </IconButton>
                        </div>
                     </>
                  ) : (
                     <div className={classes.container}>
                        <Button
                           variant="contained"
                           onClick={handleInitializeMic}
                           startIcon={<MicIcon />}
                        >
                           Activate Microphone
                        </Button>
                     </div>
                  )}
               </Grid>
            </Grid>
         </MuiDialogContent>
         <MuiDialogActions>
            <Tooltip title="Join without camera nor microphone. You will still be able to watch the streamers, give written answers to questions, share your screen and control slides.">
               <Button children="I am only watching" onClick={onRefuseStream} />
            </Tooltip>
            {!hasVideoTrack && hasAudioTrack ? (
               <ButtonWithConfirm
                  buttonLabel={joinButtonLabel}
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                  tooltipTitle="We recommend to activate your camera for a better experience."
                  buttonAction={onConfirmStream}
                  confirmDescription="Are you sure that you want to join the stream without camera?"
               />
            ) : (
               <Button
                  children={joinButtonLabel}
                  variant="contained"
                  color="primary"
                  disabled={!hasAudioTrack}
                  startIcon={hasAudioTrack && <CheckIcon />}
                  onClick={onConfirmStream}
               />
            )}
         </MuiDialogActions>
      </Dialog>
   );
}

export default StreamPublishingModal;
