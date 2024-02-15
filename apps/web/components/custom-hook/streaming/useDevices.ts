import AgoraRTC, { DeviceInfo, type IAgoraRTCError } from "agora-rtc-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

type Options = {
   /**
    * When true, agora will request for the browsers devices
    */
   enable: boolean
   deviceType: "camera" | "microphone"
}

const updateAndSetDevices = (
   currentDevices: MediaDeviceInfo[],
   activeDeviceId: string,
   setActiveDeviceId: (id: string) => void,
   dev: DeviceInfo
) => {
   const isNew = dev.state === "ACTIVE"
   const newDevices = isNew
      ? [dev.device, ...currentDevices]
      : currentDevices.filter(
           (device) => device.deviceId !== dev.device.deviceId
        )

   if (isNew) {
      setActiveDeviceId(dev.device.deviceId)
   } else {
      const activeDeviceWasRemoved = activeDeviceId === dev.device.deviceId
      if (activeDeviceWasRemoved) {
         setActiveDeviceId(newDevices[0].deviceId || "")
      }
   }
   return newDevices
}

/**
 * Custom hook to manage and interact with media devices (camera and microphone).
 * It allows enabling/disabling device fetching, setting active devices, and handling errors.
 *
 * @param {Options} options - Configuration options for the hook. Includes `enable` flag and `deviceType` to specify the device.
 * @returns {Object} An object containing the active device ID, list of devices, error state, and a function to set the active device ID.
 */
export const useDevices = (options: Options) => {
   const [activeDeviceId, setActiveDeviceId] = useState<string>("")
   const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
   const [error, setError] = useState<IAgoraRTCError | null>(null)

   /**
    * Default device have the id "default" which is not unique
    * so we need to use the device change counter to force the
    * track to re-initialize when the default device changes.
    */
   const [deviceLastChanged, setDeviceLastChanged] = useState(0)

   const handleChangeActiveDevice = useCallback((deviceId: string) => {
      setActiveDeviceId(deviceId)
      setDeviceLastChanged(Date.now())
   }, [])

   /**
    * This useEffect hook is used to initialize the selected devices.
    * Optionally, a preferred deviceId can be retrieved from local storage, similar to the previous streaming application.
    */
   useEffect(() => {
      if (!options.enable) return

      const fetchDevices =
         options.deviceType === "camera"
            ? AgoraRTC.getCameras
            : AgoraRTC.getMicrophones

      fetchDevices()
         .then((fetchedDevices) => {
            setActiveDeviceId(fetchedDevices[0]?.deviceId ?? "")
            setDevices(fetchedDevices)
         })
         .catch((error) => {
            setError(error)
            errorLogAndNotify(error)
         })

      return () => {
         setActiveDeviceId("")
         setDevices([])
         setError(null)
      }
   }, [options.deviceType, options.enable])

   useEffect(() => {
      const deviceChangedHandler = (dev: DeviceInfo) => {
         const updatedDevices = updateAndSetDevices(
            devices,
            activeDeviceId,
            handleChangeActiveDevice,
            dev
         )
         setDevices(updatedDevices)
      }

      if (options.deviceType === "camera") {
         AgoraRTC.onCameraChanged = deviceChangedHandler
      }

      if (options.deviceType === "microphone") {
         AgoraRTC.onMicrophoneChanged = deviceChangedHandler
      }

      return () => {
         AgoraRTC.onCameraChanged = null
         AgoraRTC.onMicrophoneChanged = null
      }
   }, [activeDeviceId, devices, handleChangeActiveDevice, options.deviceType])

   return useMemo(
      () => ({
         activeDeviceId,
         setActiveDeviceId,
         devices,
         error,
         deviceLastChanged,
      }),
      [activeDeviceId, deviceLastChanged, devices, error]
   )
}
