import AgoraRTC, {
   AgoraRTCReactError,
   DeviceInfo,
   IAgoraRTCError,
   useCurrentUID,
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
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useStreamingContext } from "./Streaming"
import { errorLogAndNotify } from "util/CommonUtil"
import { type LocalUser } from "../types"

type LocalTracksProviderProps = {
   children: ReactNode
}

type LocalTracksContextProps = {
   localCameraTrack: ReturnType<typeof useLocalCameraTrack>
   localMicrophoneTrack: ReturnType<typeof useLocalMicrophoneTrack>
   cameraOn: boolean
   microphoneOn: boolean
   microphoneMuted: boolean
   toggleCamera: () => void
   toggleMicMuted: () => void
   activeCameraId: string
   activeMicrophoneId: string
   setActiveCameraId: (cameraId: string) => void
   setActiveMicrophoneId: (microphoneId: string) => void
   microphoneError: IAgoraRTCError | AgoraRTCReactError
   cameraError: IAgoraRTCError | AgoraRTCReactError
   cameraDevices: MediaDeviceInfo[]
   microphoneDevices: MediaDeviceInfo[]
   localUser: LocalUser
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
   const currentUserUID = useCurrentUID()

   const [cameraOn, setCameraOn] = useState(true)

   const [microphoneMuted, setMicrophoneMuted] = useState(false)

   const {
      data: cameras,
      mutate: refetchCameras,
      error: fetchCamerasError,
   } = useCameras(shouldStream)
   const {
      data: microphones,
      mutate: refetchMicrophones,
      error: fetchMicsError,
   } = useMicrophones(shouldStream)

   const [activeCameraId, setActiveCameraId] = useState<string>("")
   const [activeMicrophoneId, setActiveMicrophoneId] = useState<string>("")

   const cameraTrack = useLocalCameraTrack(shouldStream ? cameraOn : false)
   const microphoneTrack = useLocalMicrophoneTrack(shouldStream)

   /**
    * This useEffect hook is used to initialize the selected devices.
    * Optionally, a preferred deviceId can be retrieved from local storage, similar to the previous streaming application.
    */
   useEffect(() => {
      if (!shouldStream) return

      AgoraRTC.getCameras()
         .then((cameras) => {
            setActiveCameraId(cameras[0]?.deviceId ?? "")
         })
         .catch(errorLogAndNotify)

      AgoraRTC.getMicrophones()
         .then((microphones) => {
            setActiveMicrophoneId(microphones[0]?.deviceId ?? "")
         })
         .catch(errorLogAndNotify)

      return () => {
         setActiveCameraId("")
         setActiveMicrophoneId("")
      }
   }, [shouldStream])

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

   /**
    * For an improved user experience, the microphone is only muted/unmuted rather than being turned off/on.
    * This approach avoids the delay caused by re-initializing the microphone device, which can lead to the
    * first few words not being heard by the audience when a streamer unmute and starts speaking immediately.
    * In contrast, the camera can be safely turned off/on without such delays as people don't expect to see the streamer
    * immediately when they turn on their camera.
    *
    * PS: this is the same approach Teams uses.
    */
   const toggleMicMuted = useCallback(
      () => setMicrophoneMuted((prev) => !prev),
      []
   )

   const toggleCamera = useCallback(() => setCameraOn((prev) => !prev), [])

   const readToPublish = shouldStream && isReady

   const localUser = useMemo<LocalUser | null>(() => {
      // If the user is ready to publish, return the local user object
      if (readToPublish) {
         return {
            type: "local",
            user: {
               uid: currentUserUID,
               hasAudio: !microphoneMuted,
               hasVideo: cameraOn,
               audioTrack: microphoneTrack.localMicrophoneTrack,
               videoTrack: cameraTrack.localCameraTrack,
            },
         }
      }
      return null
   }, [
      readToPublish,
      currentUserUID,
      microphoneMuted,
      cameraOn,
      microphoneTrack.localMicrophoneTrack,
      cameraTrack.localCameraTrack,
   ])

   usePublish(
      [microphoneTrack.localMicrophoneTrack, cameraTrack.localCameraTrack],
      readToPublish
   )

   const value = useMemo<LocalTracksContextProps>(
      () => ({
         localCameraTrack: cameraTrack,
         localMicrophoneTrack: microphoneTrack,
         cameraOn,
         microphoneMuted,
         microphoneOn: shouldStream, // Mic is always on when streaming, can be muted
         toggleCamera,
         toggleMicMuted,
         activeCameraId,
         activeMicrophoneId,
         setActiveCameraId,
         setActiveMicrophoneId,
         microphoneError: microphoneTrack.error || fetchMicsError,
         cameraError: cameraTrack.error || fetchCamerasError,
         cameraDevices: cameras,
         microphoneDevices: microphones,
         localUser,
      }),
      [
         cameraTrack,
         microphoneTrack,
         cameraOn,
         microphoneMuted,
         shouldStream,
         toggleCamera,
         toggleMicMuted,
         activeCameraId,
         activeMicrophoneId,
         fetchMicsError,
         fetchCamerasError,
         cameras,
         microphones,
         localUser,
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
