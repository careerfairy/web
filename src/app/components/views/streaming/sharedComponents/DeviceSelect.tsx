import React, { useEffect, useMemo, useRef, useState } from "react";
import {
   Box,
   FormControl,
   IconButton,
   InputLabel,
   MenuItem,
   Select,
   Typography,
} from "@mui/material";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import LoadingButton from "@mui/lab/LoadingButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import {
   DeviceList,
   LocalMediaHandlers,
   LocalStream,
   MediaControls,
} from "../../../../types/streaming";
import { Theme } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../../../../store/reducers";
import SoundLevelDisplay from "../../common/SoundLevelDisplay";
import MicOffIcon from "@mui/icons-material/MicOff";
import * as actions from "store/actions";

const styles = {
   gridItemContent: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
   },
   title: {
      textAlign: "center",
      marginBottom: 2,
      fontWeight: "700",
      fontSize: "0.9rem",
      color: (theme: Theme) => theme.palette.grey[300],
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
   iconWrapper: {
      mt: 1,
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
   },
   container: {
      paddingBottom: 3,
      textAlign: "center",
   },
} as const;
type Props = {
   localStream: LocalStream;
   title?: string;
   selectTitle: string;
   mediaDeviceType: "microphone" | "camera";
   devices: DeviceList;
   mediaControls: MediaControls;
   showSoundMeter?: boolean;
   localMediaHandlers: LocalMediaHandlers;
   openModal: boolean;
   displayableMediaStream: MediaStream;
};
const DeviceSelect = ({
   localStream,
   title,
   devices,
   mediaDeviceType,
   mediaControls,
   selectTitle,
   showSoundMeter,
   localMediaHandlers,
   openModal,
   displayableMediaStream,
}: Props) => {
   const [activatingDevice, setActivatingDevice] = useState(false);
   const testVideoRef = useRef(null);
   const dispatch = useDispatch();

   const isCamera = mediaDeviceType === "camera";

   const {
      deniedError,
      deviceList,
      inUseError,
      initializeMethod,
      localStorageKey,
      mediaCloseMethod,
      source,
      track,
      updateMethod,
   } = useMemo(() => {
      return {
         deviceList: isCamera ? "videoDeviceList" : "audioInputList",
         source: isCamera ? "videoSource" : "audioSource",
         track: isCamera ? "videoTrack" : "audioTrack",
         updateMethod: isCamera ? "updateVideoSource" : "updateAudioSource",
         inUseError: isCamera
            ? "cameraIsUsedByOtherApp"
            : "microphoneIsUsedByOtherApp",
         mediaCloseMethod: isCamera
            ? "closeLocalCameraTrack"
            : "closeLocalMicrophoneTrack",
         localStorageKey: isCamera
            ? "hasEnabledCamera"
            : "hasEnabledMicrophone",
         deniedError: isCamera ? "cameraDenied" : "microphoneDenied",
         initializeMethod: isCamera
            ? "initializeLocalVideoStream"
            : "initializeLocalAudioStream",
      };
   }, [isCamera]);

   const noDevices = Boolean(!devices[deviceList].length);

   useEffect(() => {
      if (
         isCamera &&
         openModal &&
         displayableMediaStream &&
         displayableMediaStream.getVideoTracks().length > 0 &&
         testVideoRef.current
      ) {
         testVideoRef.current.srcObject = displayableMediaStream;
      }
   }, [displayableMediaStream, openModal, testVideoRef.current, isCamera]);

   const deviceInUseByAnotherApp = useSelector((state: RootState) => {
      return state.stream.agoraState.deviceErrors[inUseError];
   });

   const deviceDenied = useSelector((state: RootState) => {
      return state.stream.agoraState.deviceErrors[deniedError];
   });

   const activateDeviceButtonLabel = useMemo(() => {
      if (noDevices) {
         if (deviceDenied) {
            return `${
               isCamera ? "Camera" : "Microphone"
            } Access Is Not Authorized`;
         }
         return `No ${isCamera ? "Camera" : "Microphone"} Detected`;
      }
      if (deviceInUseByAnotherApp) {
         return `This ${
            isCamera ? "Camera" : "Microphone"
         } is currently being used by another app`;
      }
      return `Activate ${isCamera ? "Camera" : "Microphone"}`;
   }, [noDevices, deviceDenied, deviceInUseByAnotherApp]);

   const handleChangeDevice = async (event) => {
      await mediaControls[updateMethod](event.target.value);
   };

   const handleCloseDevice = async () => {
      await localMediaHandlers[mediaCloseMethod]();
      localStorage.setItem(localStorageKey, "false");
   };

   const handleInitializeDevice = async () => {
      try {
         setActivatingDevice(true);
         await localMediaHandlers[initializeMethod]();
         localStorage.setItem(localStorageKey, "true");
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setActivatingDevice(false);
   };

   return (
      <Box sx={styles.gridItemContent}>
         {title && <Typography sx={styles.title}>{title}</Typography>}
         {localStream?.[track] ? (
            <>
               <FormControl
                  disabled={!devices[deviceList].length}
                  sx={{
                     marginBottom: 2,
                     fontSize: "0.8rem",
                     width: "100%",
                     maxHeight: 200,
                  }}
                  size="small"
                  variant="outlined"
               >
                  <InputLabel
                     id={
                        isCamera
                           ? "camera-select-label"
                           : "microphone-select-label"
                     }
                  >
                     {selectTitle}
                  </InputLabel>
                  <Select
                     labelId={
                        isCamera
                           ? "camera-select-label"
                           : "microphone-select-label"
                     }
                     value={mediaControls[source] || ""}
                     onChange={handleChangeDevice}
                     id={selectTitle}
                     label={selectTitle}
                  >
                     <MenuItem value="" disabled>
                        {selectTitle}
                     </MenuItem>
                     {devices[deviceList].map((device) => {
                        return (
                           <MenuItem key={device.value} value={device.value}>
                              {device.text}
                           </MenuItem>
                        );
                     })}
                  </Select>
               </FormControl>
               {deviceInUseByAnotherApp ? (
                  <Box sx={[styles.videoBox, { p: 1 }]}>
                     <Typography align="center" variant="body1">
                        This device is currently being used by another app
                     </Typography>
                  </Box>
               ) : (
                  <>
                     {isCamera ? (
                        <Box
                           sx={styles.videoBox}
                           component="video"
                           ref={testVideoRef}
                           muted={true}
                           autoPlay
                        />
                     ) : (
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
                     )}
                  </>
               )}
               <Box sx={styles.iconWrapper}>
                  <IconButton
                     aria-label={
                        isCamera
                           ? "turn-off-video-icon"
                           : "turn-off-camera-icon"
                     }
                     size="medium"
                     onClick={handleCloseDevice}
                  >
                     {isCamera ? (
                        <VideocamOffIcon fontSize="inherit" />
                     ) : (
                        <MicOffIcon fontSize="inherit" />
                     )}
                  </IconButton>
               </Box>
            </>
         ) : (
            <Box sx={styles.container}>
               <LoadingButton
                  variant="contained"
                  loading={activatingDevice}
                  disabled={
                     noDevices || deviceDenied || deviceInUseByAnotherApp
                  }
                  onClick={handleInitializeDevice}
                  startIcon={isCamera ? <VideocamIcon /> : <MicIcon />}
               >
                  {activateDeviceButtonLabel}
               </LoadingButton>
            </Box>
         )}
      </Box>
   );
};

export default DeviceSelect;
