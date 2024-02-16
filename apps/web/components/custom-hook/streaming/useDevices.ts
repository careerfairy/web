import AgoraRTC, { DeviceInfo, type IAgoraRTCError } from "agora-rtc-react"
import { useSnackbar } from "notistack"
import { useEffect, useMemo, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

type Options = {
   /**
    * When true, agora will request for the browsers devices
    */
   enable: boolean
   deviceType: "camera" | "microphone"
}

const removeDefaultDevices = (devices: MediaDeviceInfo[]) =>
   devices.filter((device) => device.deviceId !== "default")

/**
 * Custom hook to manage and interact with media devices (camera and microphone).
 * It allows enabling/disabling device fetching, setting active devices, and handling errors.
 *
 * @param {Options} options - Configuration options for the hook. Includes `enable` flag and `deviceType` to specify the device.
 * @returns {Object} An object containing the active device ID, list of devices, error state, and a function to set the active device ID.
 */
export const useDevices = (options: Options) => {
   const { enqueueSnackbar } = useSnackbar()
   const [activeDeviceId, setActiveDeviceId] = useState<string>("")
   const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
   const [error, setError] = useState<IAgoraRTCError | null>(null)

   /**
    * Debug for simone
    */
   if (options.deviceType === "microphone") {
      console.group("🚀 ~ device state:")
      console.log({
         activeDeviceId,
         error,
      })
      console.table(devices)
      console.groupEnd()
   }

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
         .then(removeDefaultDevices)
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
      const handleAddDevice = (dev: DeviceInfo) => {
         const newDevices = removeDefaultDevices([dev.device, ...devices])
         setActiveDeviceId(newDevices[0].deviceId || "")
         setDevices(newDevices)
         enqueueSnackbar(
            `Device added: ${dev.device.label} (ID: ${dev.device.deviceId})`,
            { variant: "success" }
         )
      }

      const handleRemoveDevice = (dev: DeviceInfo) => {
         const newDevices = devices.filter(
            (device) => device.deviceId !== dev.device.deviceId
         )

         const activeDeviceWasRemoved = activeDeviceId === dev.device.deviceId
         setDevices(newDevices)
         enqueueSnackbar(
            `Device removed: ${dev.device.label} (ID: ${dev.device.deviceId})`,
            { variant: "info" }
         )
         if (activeDeviceWasRemoved) {
            setActiveDeviceId(newDevices[0].deviceId || "")
            enqueueSnackbar(
               `Setting new active device to: ${newDevices[0].label} (ID: ${newDevices[0].deviceId})`,
               { variant: "info" }
            )
         }
      }

      const deviceChangedHandler = (dev: DeviceInfo) => {
         if (dev.state === "ACTIVE") {
            handleAddDevice(dev)
         }

         if (dev.state === "INACTIVE") {
            handleRemoveDevice(dev)
         }
      }

      if (options.deviceType === "camera") {
         AgoraRTC.onCameraChanged = deviceChangedHandler
      }

      if (options.deviceType === "microphone") {
         AgoraRTC.onMicrophoneChanged = deviceChangedHandler
      }
   }, [activeDeviceId, devices, enqueueSnackbar, options.deviceType])

   return useMemo(
      () => ({
         activeDeviceId,
         setActiveDeviceId,
         devices,
         error,
      }),
      [activeDeviceId, devices, error]
   )
}
