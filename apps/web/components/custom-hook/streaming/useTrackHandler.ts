import {
   DeviceInfo,
   ICameraVideoTrack,
   IMicrophoneAudioTrack,
} from "agora-rtc-react"
import { useSnackbar } from "notistack"
import { useCallback, useEffect, useMemo, useState } from "react"
import useSnackbarNotifications from "../useSnackbarNotifications"
import { useAgoraDevices } from "components/views/streaming-page/context/AgoraDevices"

const getTrackDeviceId = (track: ICameraVideoTrack | IMicrophoneAudioTrack) => {
   let deviceId = ""
   if (track) {
      deviceId = track.getMediaStreamTrack().getSettings().deviceId
   }
   return deviceId
}

/**
 * Custom hook to handle track device changes and errors.
 *
 * This hook allows setting a device for a given track and handles
 * device changes or errors by updating the active device ID and displaying notifications.
 *
 * @param deviceType - The type of device to handle.
 * @param track - The track to set the device for.
 * @param options - Optional parameters including the initial device ID.
 * @returns The active device ID and a function to set the active device.
 */
export const useTrackHandler = (
   deviceType: "camera" | "microphone",
   track: ICameraVideoTrack | IMicrophoneAudioTrack
) => {
   const { enqueueSnackbar } = useSnackbar()
   const { errorNotification } = useSnackbarNotifications()

   const {
      cameras,
      microphones,
      registerCameraChangedCallback,
      unregisterCameraChangedCallback,
      registerMicrophoneChangedCallback,
      unregisterMicrophoneChangedCallback,
   } = useAgoraDevices()

   const devices = deviceType === "camera" ? cameras : microphones

   const [activeDeviceId, setActiveDeviceId] = useState<string>("")

   const changeAndSetActiveDevice = useCallback(
      async (deviceId: string) => {
         if (track) {
            try {
               await track.setDevice(deviceId)
               setActiveDeviceId(getTrackDeviceId(track))
            } catch (error) {
               errorNotification(
                  error,
                  `Failed to set the active ${deviceType} device`,
                  {
                     message: `Failed to set the active ${deviceType} device`,
                     metadata: {
                        deviceId,
                        deviceType: deviceType,
                        track: track,
                     },
                  }
               )
            }
         }
      },
      [deviceType, errorNotification, track]
   )

   useEffect(() => {
      setActiveDeviceId(getTrackDeviceId(track))
   }, [track, devices])

   /**
    * Monitors device changes and updates the track accordingly.
    * This function is triggered when the currently active device is disconnected,
    * ensuring the track is kept up-to-date with a new device selection.
    */
   useEffect(() => {
      const onDeviceChange = async (dev: DeviceInfo) => {
         if (dev.state === "INACTIVE" && dev.device.kind) {
            const activeDeviceWasRemoved =
               activeDeviceId === dev.device.deviceId

            if (activeDeviceWasRemoved) {
               // find the first device that is not the active device
               const replacementDevice = devices.find(
                  (d) => d.deviceId !== activeDeviceId
               )
               if (replacementDevice) {
                  await changeAndSetActiveDevice(replacementDevice.deviceId)
                  enqueueSnackbar(
                     `Successfully set new active device to: ${replacementDevice.label} (ID: ${replacementDevice.deviceId})`
                  )
               } else {
                  console.warn("🚀 ~ No replacement device found", {
                     activeDeviceId,
                     devices,
                  })
               }
            }
         }
      }

      const registerCallback =
         deviceType === "camera"
            ? registerCameraChangedCallback
            : registerMicrophoneChangedCallback

      const unregisterCallback =
         deviceType === "camera"
            ? unregisterCameraChangedCallback
            : unregisterMicrophoneChangedCallback

      registerCallback(onDeviceChange)

      return () => {
         unregisterCallback(onDeviceChange)
      }
   }, [
      activeDeviceId,
      enqueueSnackbar,
      changeAndSetActiveDevice,
      cameras,
      microphones,
      deviceType,
      registerCameraChangedCallback,
      registerMicrophoneChangedCallback,
      unregisterCameraChangedCallback,
      unregisterMicrophoneChangedCallback,
      devices,
   ])

   return useMemo(
      () => ({
         activeDeviceId,
         handleSetActiveDevice: changeAndSetActiveDevice,
      }),
      [activeDeviceId, changeAndSetActiveDevice]
   )
}
