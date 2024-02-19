import React, {
   createContext,
   useContext,
   useEffect,
   useState,
   useRef,
   ReactNode,
   useMemo,
   useCallback,
} from "react"
import AgoraRTC, { DeviceInfo, IAgoraRTCError } from "agora-rtc-react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "./Streaming"
import { useSnackbar } from "notistack"

type CallbackType = (dev: DeviceInfo) => void

type DeviceContextType = {
   /** Array of MediaDeviceInfo objects representing the microphones available. */
   microphones: MediaDeviceInfo[]
   /** Array of MediaDeviceInfo objects representing the cameras available. */
   cameras: MediaDeviceInfo[]
   /** Error object from AgoraRTC when fetching cameras fails, or null if no error. */
   fetchCamerasError: IAgoraRTCError | null
   /** Error object from AgoraRTC when fetching microphones fails, or null if no error. */
   fetchMicsError: IAgoraRTCError | null
   /** Registers a callback function to be called when the camera devices change. */
   registerCameraChangedCallback: (callback: CallbackType) => void
   /** Unregisters a previously registered callback for camera device changes. */
   unregisterCameraChangedCallback: (callback: CallbackType) => void
   /** Registers a callback function to be called when the microphone devices change. */
   registerMicrophoneChangedCallback: (callback: CallbackType) => void
   /** Unregisters a previously registered callback for microphone device changes. */
   unregisterMicrophoneChangedCallback: (callback: CallbackType) => void
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

type DeviceProviderProps = {
   children: ReactNode
}

export const AgoraDevicesProvider = ({ children }: DeviceProviderProps) => {
   const { shouldStream } = useStreamingContext()
   const { enqueueSnackbar } = useSnackbar()

   const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
   const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])

   const [fetchCamerasError, setFetchCamerasError] =
      useState<IAgoraRTCError | null>(null)
   const [fetchMicsError, setFetchMicsError] = useState<IAgoraRTCError | null>(
      null
   )

   const cameraChangedCallback = useRef<CallbackType[]>([])
   const microphoneChangedCallback = useRef<CallbackType[]>([])

   const fetchAndSetDevices = useCallback(async () => {
      const [camerasResult, microphonesResult] = await Promise.allSettled([
         AgoraRTC.getCameras(),
         AgoraRTC.getMicrophones(),
      ])

      setCameras(
         camerasResult.status === "fulfilled" ? camerasResult.value : []
      )
      setMicrophones(
         microphonesResult.status === "fulfilled" ? microphonesResult.value : []
      )

      if (camerasResult.status === "rejected") {
         const fetchCamerasError = camerasResult.reason as IAgoraRTCError
         setFetchCamerasError(fetchCamerasError)
         errorLogAndNotify(fetchCamerasError)
      }

      if (microphonesResult.status === "rejected") {
         const fetchMicsError = microphonesResult.reason as IAgoraRTCError
         setFetchMicsError(fetchMicsError)
         errorLogAndNotify(fetchMicsError)
      }
   }, [])

   /**
    * This useEffect hook is used to initialize the selected devices.
    * Optionally, a preferred deviceId can be retrieved from local storage, similar to the previous streaming application.
    */
   useEffect(() => {
      if (!shouldStream) return

      fetchAndSetDevices()

      return () => {
         setCameras([])
         setMicrophones([])
         setFetchCamerasError(null)
         setFetchMicsError(null)
      }
   }, [fetchAndSetDevices, shouldStream])

   useEffect(() => {
      const handleAddDevice = (
         dev: DeviceInfo,
         type: "camera" | "microphone"
      ) => {
         const devices = type === "camera" ? cameras : microphones
         const newDevices = [dev.device, ...devices]

         const setter = type === "camera" ? setCameras : setMicrophones
         setter(newDevices)

         enqueueSnackbar(
            `Device detected: ${dev.device.label} (ID: ${dev.device.deviceId})`
         )
      }

      const handleRemoveDevice = (
         dev: DeviceInfo,
         type: "camera" | "microphone"
      ) => {
         const devices = type === "camera" ? cameras : microphones

         const newDevices = devices.filter(
            (device) => device.deviceId !== dev.device.deviceId
         )

         const setter = type === "camera" ? setCameras : setMicrophones
         setter(newDevices)

         enqueueSnackbar(
            `Device removed: ${dev.device.label} (ID: ${dev.device.deviceId})`
         )
      }

      const handleDeviceChange = (
         dev: DeviceInfo,
         type: "camera" | "microphone"
      ) => {
         fetchAndSetDevices()
         if (dev.state === "ACTIVE") {
            handleAddDevice(dev, type)
         }

         if (dev.state === "INACTIVE") {
            handleRemoveDevice(dev, type)
         }

         if (type === "camera") {
            cameraChangedCallback.current.forEach((callback) => callback(dev))
            setFetchCamerasError(null)
         }

         if (type === "microphone") {
            microphoneChangedCallback.current.forEach((callback) =>
               callback(dev)
            )
            setFetchMicsError(null)
         }
      }

      AgoraRTC.onCameraChanged = (dev: DeviceInfo) =>
         handleDeviceChange(dev, "camera")
      AgoraRTC.onMicrophoneChanged = (dev: DeviceInfo) =>
         handleDeviceChange(dev, "microphone")

      return () => {
         AgoraRTC.onCameraChanged = null
         AgoraRTC.onMicrophoneChanged = null
      }
   }, [cameras, enqueueSnackbar, fetchAndSetDevices, microphones])

   const registerCameraChangedCallback = useCallback(
      (callback: CallbackType) => {
         cameraChangedCallback.current.push(callback)
      },
      []
   )

   const unregisterCameraChangedCallback = useCallback(
      (callback: CallbackType) => {
         cameraChangedCallback.current = cameraChangedCallback.current.filter(
            (cb) => cb !== callback
         )
      },
      []
   )

   const registerMicrophoneChangedCallback = useCallback(
      (callback: CallbackType) => {
         microphoneChangedCallback.current.push(callback)
      },
      []
   )

   const unregisterMicrophoneChangedCallback = useCallback(
      (callback: CallbackType) => {
         microphoneChangedCallback.current =
            microphoneChangedCallback.current.filter((cb) => cb !== callback)
      },
      []
   )

   const value = useMemo<DeviceContextType>(
      () => ({
         microphones,
         cameras,
         fetchCamerasError,
         fetchMicsError,
         registerCameraChangedCallback,
         unregisterCameraChangedCallback,
         registerMicrophoneChangedCallback,
         unregisterMicrophoneChangedCallback,
      }),
      [
         microphones,
         cameras,
         fetchCamerasError,
         fetchMicsError,
         registerCameraChangedCallback,
         unregisterCameraChangedCallback,
         registerMicrophoneChangedCallback,
         unregisterMicrophoneChangedCallback,
      ]
   )

   return (
      <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
   )
}

export const useAgoraDevices = () => {
   const context = useContext(DeviceContext)
   if (!context) {
      throw new Error("useDevices must be used within a DeviceProvider")
   }
   return context
}
