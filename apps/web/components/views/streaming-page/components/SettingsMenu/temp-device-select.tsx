import { useLocalTracks } from "../../context"
import { getRTCErrorCode } from "../../util"
import { DeviceSelect } from "../streaming/DeviceSelect"
import { useSettingsMenu } from "./SettingsMenuContext"

export const TempCameraSelect = () => {
   const { fetchCamerasError, cameraDevices } = useLocalTracks()
   const { setTempCameraId, tempCameraId, tempCameraTrack } = useSettingsMenu()
   return (
      <DeviceSelect
         key={cameraDevices.length}
         label="Camera"
         options={cameraDevices}
         onDeviceSelect={setTempCameraId}
         value={tempCameraId}
         permissionDenied={
            getRTCErrorCode(fetchCamerasError || tempCameraTrack.error) ===
            "PERMISSION_DENIED"
         }
      />
   )
}

export const TempMicrophoneSelect = () => {
   const { fetchMicsError, microphoneDevices } = useLocalTracks()
   const { setTempMicrophoneId, tempMicrophoneId, tempMicrophoneTrack } =
      useSettingsMenu()

   return (
      <DeviceSelect
         label="Microphone"
         options={microphoneDevices}
         onDeviceSelect={setTempMicrophoneId}
         value={tempMicrophoneId}
         permissionDenied={
            getRTCErrorCode(fetchMicsError || tempMicrophoneTrack.error) ===
            "PERMISSION_DENIED"
         }
      />
   )
}
