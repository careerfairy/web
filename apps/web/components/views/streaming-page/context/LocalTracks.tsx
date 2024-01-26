import AgoraRTC, {
   DeviceInfo,
   useLocalCameraTrack,
   useLocalMicrophoneTrack,
   usePublish,
} from "agora-rtc-react"
import { useCameras } from "components/custom-hook/streaming/useCameras"
import { useMicrophones } from "components/custom-hook/streaming/useMicrophones"
import {
   FC,
   ReactNode,
   createContext,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useStreamingContext } from "./Streaming"

type LocalTracksContextProps = {
   localCameraTrack: ReturnType<typeof useLocalCameraTrack>
   localMicrophoneTrack: ReturnType<typeof useLocalMicrophoneTrack>
   cameraOn: boolean
   micOn: boolean
   toggleCamera: () => void
   toggleMicrophone: () => void
   activeCameraId: string
   activeMicrophoneId: string
   setActiveCameraId: (cameraId: string) => void
   setActiveMicrophoneId: (microphoneId: string) => void
}

type LocalTracksProviderProps = {
   children: ReactNode
}

const LocalTracksContext = createContext<LocalTracksContextProps | undefined>(
   undefined
)

const setActiveDevice = (
   setActiveDeviceId: (id: string) => void,
   dev: DeviceInfo
) => {
   if (dev.state === "ACTIVE") {
      setActiveDeviceId(dev.device.deviceId)
      return true
   }
   return false
}

const setFirstAvailableDevice = (
   devices: MediaDeviceInfo[],
   setActiveDeviceId: (id: string) => void,
   dev: DeviceInfo
) => {
   if (devices.length > 0) {
      setActiveDeviceId(
         devices.find((device) => device.deviceId !== dev.device.deviceId)
            ?.deviceId ?? ""
      )
   }
}

export const LocalTracksProvider: FC<LocalTracksProviderProps> = ({
   children,
}) => {
   const { isReady, shouldStream } = useStreamingContext()

   const [cameraOn, setCameraOn] = useState(false)
   const [micOn, setMicOn] = useState(false)

   const { data: cameras, mutate: refetchCameras } = useCameras()
   const { data: microphones, mutate: refetchMicrophones } = useMicrophones()

   const [activeCameraId, setActiveCameraId] = useState<string>("")
   const [activeMicrophoneId, setActiveMicrophoneId] = useState<string>("")

   const cameraTrack = useLocalCameraTrack(cameraOn)
   const microphoneTrack = useLocalMicrophoneTrack(micOn)

   /**
    * This useEffect hook is used to initialize the selected devices.
    * Optionally, a preferred deviceId can be retrieved from local storage, similar to the previous streaming application.
    */
   useEffect(() => {
      AgoraRTC.getDevices()
         .then((devices) => {
            setActiveCameraId(
               devices.find((device) => device.kind === "videoinput")
                  ?.deviceId ?? ""
            )
            setActiveMicrophoneId(
               devices.find((device) => device.kind === "audioinput")
                  ?.deviceId ?? ""
            )
         })
         .catch(console.error)

      return () => {
         setActiveCameraId("")
         setActiveMicrophoneId("")
      }
   }, [])

   useEffect(() => {
      AgoraRTC.onCameraChanged = (dev) => {
         refetchCameras() // Refetch cameras when camera is plugged in or unplugged
         if (cameraTrack.localCameraTrack) {
            const isActive = setActiveDevice(setActiveCameraId, dev)
            if (!isActive) {
               setFirstAvailableDevice(cameras, setActiveCameraId, dev)
            }
         }
      }
      AgoraRTC.onMicrophoneChanged = (dev) => {
         refetchMicrophones() // Refetch microphones when mic is plugged in or unplugged
         if (microphoneTrack.localMicrophoneTrack) {
            const isActive = setActiveDevice(setActiveMicrophoneId, dev)
            if (!isActive) {
               setFirstAvailableDevice(microphones, setActiveMicrophoneId, dev)
            }
         }
      }

      return () => {
         AgoraRTC.onCameraChanged = null
         AgoraRTC.onMicrophoneChanged = null
      }
   }, [
      cameraTrack,
      cameras,
      microphoneTrack.localMicrophoneTrack,
      microphones,
      refetchCameras,
      refetchMicrophones,
   ])

   /**
    * Uses the `activeCameraId` and `activeMicrophoneId` to set the active local devices
    * for the camera and microphone tracks.
    */
   useEffect(() => {
      if (cameraTrack.localCameraTrack && activeCameraId) {
         cameraTrack.localCameraTrack.setDevice(activeCameraId)
      }
   }, [activeCameraId, cameraTrack.localCameraTrack])

   useEffect(() => {
      if (microphoneTrack.localMicrophoneTrack && activeMicrophoneId) {
         microphoneTrack.localMicrophoneTrack.setDevice(activeMicrophoneId)
      }
   }, [activeMicrophoneId, microphoneTrack.localMicrophoneTrack])

   const readToPublish = shouldStream && isReady

   usePublish(
      [microphoneTrack.localMicrophoneTrack, cameraTrack.localCameraTrack],
      readToPublish
   )

   const value = useMemo<LocalTracksContextProps>(
      () => ({
         localCameraTrack: cameraTrack,
         localMicrophoneTrack: microphoneTrack,
         cameraOn,
         micOn,
         toggleCamera: () => setCameraOn((prev) => !prev),
         toggleMicrophone: () => setMicOn((prev) => !prev),
         activeCameraId,
         activeMicrophoneId,
         setActiveCameraId,
         setActiveMicrophoneId,
      }),
      [
         cameraTrack,
         microphoneTrack,
         cameraOn,
         micOn,
         activeCameraId,
         activeMicrophoneId,
      ]
   )

   return (
      <LocalTracksContext.Provider value={value}>
         {children}
      </LocalTracksContext.Provider>
   )
}

export const useLocalTracks = () => {
   const context = useContext(LocalTracksContext)
   if (context === undefined) {
      throw new Error(
         "useLocalTracks must be used within a LocalTracksProvider"
      )
   }
   return context
}
