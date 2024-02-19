import { Box } from "@mui/material"
import {
   getCameraErrorMessage,
   getMicrophoneErrorMessage,
   getRTCErrorCode,
} from "../../util"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"
import { DeviceSelect } from "../streaming/DeviceSelect"
import { useSettingsMenu } from "./SettingsMenuContext"
import { sxStyles } from "types/commonTypes"
import { useAgoraDevices } from "../../context/AgoraDevices"

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
   const { setTempCameraId, tempCameraId, tempCameraTrack } = useSettingsMenu()
   return (
      <Box sx={styles.root}>
         <DeviceErrorWrapper
            errorMessage={getCameraErrorMessage(
               fetchCamerasError || tempCameraTrack.error
            )}
         >
            <Box component="span" sx={styles.select}>
               <DeviceSelect
                  key={cameras.length}
                  label="Select Camera"
                  options={cameras}
                  onDeviceSelect={setTempCameraId}
                  value={tempCameraId}
                  permissionDenied={
                     getRTCErrorCode(
                        fetchCamerasError || tempCameraTrack.error
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

   const { setTempMicrophoneId, tempMicrophoneId, tempMicrophoneTrack } =
      useSettingsMenu()

   return (
      <Box sx={styles.root}>
         <DeviceErrorWrapper
            errorMessage={getMicrophoneErrorMessage(
               fetchMicsError || tempMicrophoneTrack.error
            )}
         >
            <Box component="span" sx={styles.select}>
               <DeviceSelect
                  key={microphones.length}
                  label="Select Microphone"
                  options={microphones}
                  onDeviceSelect={setTempMicrophoneId}
                  value={tempMicrophoneId}
                  permissionDenied={
                     getRTCErrorCode(
                        fetchMicsError || tempMicrophoneTrack.error
                     ) === "PERMISSION_DENIED"
                  }
               />
            </Box>
         </DeviceErrorWrapper>
      </Box>
   )
}
