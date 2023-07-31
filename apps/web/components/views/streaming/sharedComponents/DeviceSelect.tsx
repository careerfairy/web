import React, {
   ReactNode,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import {
   Box,
   capitalize,
   CircularProgress,
   FormControl,
   IconButton,
   InputLabel,
   MenuItem,
   Select,
   Tooltip,
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
import { RootState } from "../../../../store"
import SoundLevelDisplay from "../../common/SoundLevelDisplay"
import MicOffIcon from "@mui/icons-material/MicOff"
import BlurOnIcon from "@mui/icons-material/BlurOn"
import useVirtualBackgroundActions from "../../../../context/agora/useVirtualBackgroundActions"
import { videoOptionsSelector } from "../../../../store/selectors/streamSelectors"
import BlurOffIcon from "@mui/icons-material/BlurOff"
import ImageIcon from "@mui/icons-material/Image"
import HideImageIcon from "@mui/icons-material/HideImage"
import FilePickerContainer from "../../../ssr/FilePickerContainer"
import { uploadLogo } from "../../../helperFunctions/HelperFunctions"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"

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
   iconButtonSpan: {
      height: "37px",
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
               <Box sx={styles.iconWrapper}>
                  {showDisableIcon && isCamera && (
                     <IconButton
                        aria-label={"turn-off-video-icon"}
                        size="medium"
                        onClick={handleCloseDevice}
                     >
                        <VideocamOffIcon fontSize="inherit" />
                     </IconButton>
                  )}

                  {showDisableIcon && !isCamera && (
                     <IconButton
                        aria-label={"turn-off-mic-icon"}
                        size="medium"
                        onClick={handleCloseDevice}
                     >
                        <MicOffIcon fontSize="inherit" />
                     </IconButton>
                  )}
                  {isCamera && (
                     <CameraControlButtons localStream={localStream} />
                  )}
               </Box>
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

type CameraControlButtonsProps = {
   localStream: LocalStream
}

const CameraControlButtons = ({ localStream }: CameraControlButtonsProps) => {
   const {
      isBlurLoading,
      isBlurEnabled,
      hasErrored,
      backgroundImage,
      isBackgroundImageLoading,
   } = useSelector(videoOptionsSelector)
   const {
      clearBackgroundEffects,
      setBackgroundBlurring,
      checkCompatibility,
      setBackgroundImage,
   } = useVirtualBackgroundActions(localStream)

   const isBackgroundImageEnabled = backgroundImage && !isBackgroundImageLoading

   const deviceIsCompatible = useMemo(() => {
      return !hasErrored && checkCompatibility()
   }, [checkCompatibility, hasErrored])

   const toggleBlur = useCallback(() => {
      if (isBlurLoading || isBackgroundImageLoading) return

      if (isBlurEnabled) {
         void clearBackgroundEffects()
      } else {
         void setBackgroundBlurring()
      }
   }, [
      clearBackgroundEffects,
      isBackgroundImageLoading,
      isBlurEnabled,
      isBlurLoading,
      setBackgroundBlurring,
   ])

   const toggleBackgroundImage = useCallback(
      (imageUrl = undefined) => {
         if (isBackgroundImageLoading || isBlurLoading) return

         if (isBackgroundImageEnabled) {
            void clearBackgroundEffects()
         } else {
            if (imageUrl && typeof imageUrl === "string") {
               void setBackgroundImage(imageUrl)
            }
         }
      },
      [
         clearBackgroundEffects,
         isBackgroundImageEnabled,
         isBackgroundImageLoading,
         isBlurLoading,
         setBackgroundImage,
      ]
   )

   return (
      <>
         <LoadingIconButton
            tooltipTitle={getButtonTooltip(
               "blur",
               isBlurEnabled,
               isBlurLoading,
               deviceIsCompatible
            )}
            isLoading={isBlurLoading}
            onClickHandler={toggleBlur}
            disabled={!deviceIsCompatible}
            disabledChildren={<BlurOffIcon />}
         >
            <BlurOnIcon color={isBlurEnabled ? "primary" : undefined} />
         </LoadingIconButton>

         <LoadingIconButton
            tooltipTitle={getButtonTooltip(
               "image",
               isBackgroundImageEnabled,
               isBackgroundImageLoading,
               deviceIsCompatible
            )}
            isLoading={isBackgroundImageLoading}
            onClickHandler={
               isBackgroundImageEnabled ? toggleBackgroundImage : undefined
            }
            disabled={!deviceIsCompatible}
            disabledChildren={<HideImageIcon />}
         >
            {isBackgroundImageEnabled && <ImageIcon color={"primary"} />}

            {!isBackgroundImageEnabled && (
               <ImageUpload onImageUploadFinished={toggleBackgroundImage}>
                  <ImageIcon />
               </ImageUpload>
            )}
         </LoadingIconButton>
      </>
   )
}

const ImageUpload = ({ children, onImageUploadFinished }) => {
   const { errorNotification } = useSnackbarNotifications()

   const handleFilePickerError = useCallback(
      (errMsg) => {
         errorNotification(errMsg)
      },
      [errorNotification]
   )

   const handleFilePickerChange = useCallback(
      (fileObject) => {
         uploadLogo(
            "stream-background-images",
            fileObject,
            firebaseServiceInstance,
            (newUrl) => {
               onImageUploadFinished(newUrl)
            },
            () => {},
            (error) => {
               errorNotification(
                  error,
                  "Failed to upload image, try to use a different image"
               )
            }
         )
      },
      [errorNotification, onImageUploadFinished]
   )

   return (
      <FilePickerContainer
         style={filePickerDivStyles}
         extensions={["jpg", "jpeg", "png"]}
         maxSize={5}
         onError={handleFilePickerError}
         onChange={handleFilePickerChange}
      >
         {children}
      </FilePickerContainer>
   )
}

// fix to make the button round again
const filePickerDivStyles = { height: "21px" }

type LoadingIconButtonProps = {
   isLoading: boolean
   children: ReactNode
   tooltipTitle: string
   onClickHandler?: () => void
   disabledChildren?: ReactNode
   disabled?: boolean
}

const LoadingIconButton = ({
   isLoading,
   children,
   tooltipTitle,
   onClickHandler,
   disabledChildren,
   disabled,
}: LoadingIconButtonProps) => {
   let body = children
   if (isLoading) {
      body = <CircularProgress color="inherit" size={21} />
   }

   if (disabled && disabledChildren) {
      body = disabledChildren
   }

   return (
      <Tooltip title={tooltipTitle}>
         <Box sx={styles.iconButtonSpan}>
            <IconButton
               onClick={onClickHandler}
               disabled={disabled}
               disableRipple={isLoading}
            >
               {body}
            </IconButton>
         </Box>
      </Tooltip>
   )
}

function getButtonTooltip(
   type: "blur" | "image",
   isEnabled,
   isLoading,
   deviceIsCompatible
) {
   if (!deviceIsCompatible) {
      return `Your browser doesn't support the background ${type} functionality`
   }
   const suffix = `Background ${capitalize(type)}`

   if (isLoading) {
      return `Loading ${suffix}`
   }

   return `${isEnabled ? "Disable" : "Enable"} ${suffix}`
}

export default DeviceSelect
