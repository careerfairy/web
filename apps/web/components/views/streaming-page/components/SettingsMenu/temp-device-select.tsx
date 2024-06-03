import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { useAgoraDevices } from "../../context/AgoraDevices"
import {
   getCameraErrorMessage,
   getMicrophoneErrorMessage,
   getRTCErrorCode,
} from "../../util"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"
import { DeviceSelect } from "../streaming/DeviceSelect"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "grid",
   },
   select: {
      width: "100%",
   },
})

export const TempCameraSelect = () => {
   const { fetchCamerasError, cameras } = useAgoraDevices()
   const { setActiveCameraId, activeCameraId, localCameraTrack } =
      useLocalTracks()
   return (
      <Box sx={styles.root}>
         <DeviceErrorWrapper
            errorMessage={getCameraErrorMessage(
               fetchCamerasError || localCameraTrack.error
            )}
         >
            <Box component="span" sx={styles.select}>
               <DeviceSelect
                  key={cameras.length}
                  label="Select Camera"
                  options={cameras}
                  onDeviceSelect={setActiveCameraId}
                  value={activeCameraId}
                  permissionDenied={
                     getRTCErrorCode(
                        fetchCamerasError || localCameraTrack.error
                     ) === "PERMISSION_DENIED"
                  }
               />
            </Box>
         </DeviceErrorWrapper>
      </Box>
   )
}

export const TempMicrophoneSelect = () => {
   const { fetchMicsError, microphones } = useAgoraDevices()

   const { setActiveMicrophoneId, activeMicrophoneId, localMicrophoneTrack } =
      useLocalTracks()

   return (
      <Box sx={styles.root}>
         <DeviceErrorWrapper
            errorMessage={getMicrophoneErrorMessage(
               fetchMicsError || localMicrophoneTrack.error
            )}
         >
            <Box component="span" sx={styles.select}>
               <DeviceSelect
                  key={microphones.length}
                  label="Select Microphone"
                  options={microphones}
                  onDeviceSelect={setActiveMicrophoneId}
                  value={activeMicrophoneId}
                  permissionDenied={
                     getRTCErrorCode(
                        fetchMicsError || localMicrophoneTrack.error
                     ) === "PERMISSION_DENIED"
                  }
               />
            </Box>
         </DeviceErrorWrapper>
      </Box>
   )
}
