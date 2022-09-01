import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
   Box,
   FormControl,
   IconButton,
   InputLabel,
   MenuItem,
   Select,
   Typography,
} from "@mui/material"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import LoadingButton from "@mui/lab/LoadingButton"
import VideocamIcon from "@mui/icons-material/Videocam"
import MicIcon from "@mui/icons-material/Mic"
import {
   DeviceList,
   LocalMediaHandlers,
   LocalStream,
   MediaControls,
} from "../../../../types/streaming"
import { Theme } from "@mui/system"
import { useSelector } from "react-redux"
import RootState from "../../../../store/reducers"
import SoundLevelDisplay from "../../common/SoundLevelDisplay"
import MicOffIcon from "@mui/icons-material/MicOff"

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
} as const
export type DeviceSelectProps = {
   localStream: LocalStream
   title?: string
   selectTitle: string
   mediaDeviceType: "microphone" | "camera"
   devices: DeviceList
   mediaControls: MediaControls
   showSoundMeter?: boolean
   localMediaHandlers: LocalMediaHandlers
   openModal: boolean
   displayableMediaStream: MediaStream
   showDisableIcon?: boolean
   disableInitialize?: boolean
   deviceInitializers: {
      initializeCameras: () => Promise<any>
      initializeMicrophones: () => Promise<any>
   }
}
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
   deviceInitializers,
   showDisableIcon,
   disableInitialize,
}: DeviceSelectProps) => {
   const [hasEnabledDevice, setHasEnabledDevice] = useState(false)
   const [activatingDevice, setActivatingDevice] = useState(false)
   const testVideoRef = useRef(null)

   const isCamera = mediaDeviceType === "camera"

   const {
      deniedError,
      deviceList,
      inUseError,
      initializeTrackMethod,
      localStorageKey,
      mediaCloseMethod,
      source,
      track,
      updateMethod,
      initializeDeviceMethod,
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
         initializeTrackMethod: isCamera
            ? "initializeLocalVideoStream"
            : "initializeLocalAudioStream",
         initializeDeviceMethod: isCamera
            ? "initializeCameras"
            : "initializeMicrophones",
      }
   }, [isCamera])

   const noDevices = Boolean(!devices[deviceList].length)

   useEffect(() => {
      if (
         isCamera &&
         openModal &&
         displayableMediaStream &&
         displayableMediaStream.getVideoTracks().length &&
         testVideoRef.current
      ) {
         testVideoRef.current.srcObject = displayableMediaStream
      }
   }, [displayableMediaStream, openModal, testVideoRef.current, isCamera])

   useEffect(() => {
      setHasEnabledDevice(localStorage.getItem(localStorageKey) === "true")
   }, [])

   const deviceInUseByAnotherApp = useSelector((state: RootState) => {
      return state.stream.agoraState.deviceErrors[inUseError]
   })

   const deviceDenied = useSelector((state: RootState) => {
      return state.stream.agoraState.deviceErrors[deniedError]
   })

   const activateDeviceButtonLabel = useMemo(() => {
      const deviceName = isCamera ? "Camera" : "Microphone"
      const activateLabel = `Activate ${deviceName}`
      if (deviceDenied) return `${deviceName} Access Is Not Authorized`
      if (!hasEnabledDevice) return activateLabel
      if (noDevices) {
         return `No ${deviceName} Detected`
      }
      if (deviceInUseByAnotherApp) {
         return `This ${deviceName} is currently being used by another app`
      }
      return activateLabel
   }, [noDevices, deviceDenied, deviceInUseByAnotherApp, hasEnabledDevice])

   const handleChangeDevice = useCallback(
      async (event) => {
         await mediaControls[updateMethod](event.target.value)
      },
      [mediaControls, updateMethod]
   )

   const handleCloseDevice = useCallback(async () => {
      await localMediaHandlers[mediaCloseMethod]()
      localStorage.setItem(localStorageKey, "false")
   }, [localMediaHandlers, localStorageKey, mediaCloseMethod])

   const handleInitializeDevice = async () => {
      try {
         setActivatingDevice(true)
         await deviceInitializers[initializeDeviceMethod]()
         await localMediaHandlers[initializeTrackMethod]()
         localStorage.setItem(localStorageKey, "true")
      } catch (e) {
         console.error(e)
      }
      setActivatingDevice(false)
   }

   useEffect(() => {
      if (!disableInitialize && hasEnabledDevice && openModal) {
         handleInitializeDevice().catch(console.error)
      }
   }, [hasEnabledDevice, openModal, disableInitialize])

   const currentDeviceIsBeingUsedButThereAreOtherOnesAvailable =
      deviceInUseByAnotherApp && devices[deviceList].length > 1

   return (
      <Box sx={styles.gridItemContent}>
         {title && <Typography sx={styles.title}>{title}</Typography>}
         {localStream?.[track] ||
         currentDeviceIsBeingUsedButThereAreOtherOnesAvailable ? (
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
                           <MenuItem
                              onClick={() => {
                                 if (
                                    currentDeviceIsBeingUsedButThereAreOtherOnesAvailable &&
                                    device.value === mediaControls[source]
                                 ) {
                                    return mediaControls[updateMethod](
                                       device.value
                                    )
                                 }
                              }}
                              key={device.value}
                              value={device.value}
                           >
                              {device.text}
                           </MenuItem>
                        )
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
               {showDisableIcon && (
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
               )}
            </>
         ) : (
            <Box sx={styles.container}>
               <LoadingButton
                  variant="contained"
                  loading={activatingDevice}
                  disabled={
                     deviceDenied ||
                     (hasEnabledDevice &&
                        (noDevices || deviceInUseByAnotherApp))
                  }
                  onClick={handleInitializeDevice}
                  startIcon={isCamera ? <VideocamIcon /> : <MicIcon />}
               >
                  {activateDeviceButtonLabel}
               </LoadingButton>
            </Box>
         )}
      </Box>
   )
}

export default DeviceSelect
