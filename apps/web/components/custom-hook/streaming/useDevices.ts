import AgoraRTC, { DeviceInfo, type IAgoraRTCError } from "agora-rtc-react"
import { useEffect, useMemo, useState } from "react"
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
    * This useEffect hook is used to initialize the selected devices.
    * Optionally, a preferred deviceId can be retrieved from local storage, similar to the previous streaming application.
    */
   useEffect(() => {
      if (!options.enable) return

      if (options.deviceType === "camera") {
         AgoraRTC.getCameras()
            .then((cameras) => {
               setActiveDeviceId(cameras[0]?.deviceId ?? "")
               setDevices(cameras)
            })
            .catch((error) => {
               setError(error)
               errorLogAndNotify(error)
            })
      }

      if (options.deviceType === "microphone") {
         AgoraRTC.getMicrophones()
            .then((microphones) => {
               setActiveDeviceId(microphones[0]?.deviceId ?? "")
               setDevices(microphones)
            })
            .catch((error) => {
               setError(error)
               errorLogAndNotify(error)
            })
      }

      return () => {
         setActiveDeviceId("")
         setDevices([])
         setError(null)
      }
   }, [options.deviceType, options.enable])

   useEffect(() => {
      if (options.deviceType === "camera") {
         AgoraRTC.onCameraChanged = (dev) => {
            const updatedDevices = updateAndSetDevices(
               devices,
               activeDeviceId,
               setActiveDeviceId,
               dev
            )
            setDevices(updatedDevices)
         }
      }

      if (options.deviceType === "microphone") {
         AgoraRTC.onMicrophoneChanged = (dev) => {
            const updatedDevices = updateAndSetDevices(
               devices,
               activeDeviceId,
               setActiveDeviceId,
               dev
            )
            setDevices(updatedDevices)
         }
      }

      return () => {
         AgoraRTC.onCameraChanged = null
         AgoraRTC.onMicrophoneChanged = null
      }
   }, [activeDeviceId, devices, options.deviceType])

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
