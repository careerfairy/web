import {
   AgoraRTCReactError,
   IAgoraRTCError,
   useCurrentUID,
   useLocalCameraTrack,
   useLocalMicrophoneTrack,
   usePublish,
} from "agora-rtc-react"
import {
   FC,
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { useStreamingContext } from "./Streaming"
import { type LocalUser } from "../types"
import { useDevices } from "components/custom-hook/streaming/useDevices"
import { useSetDevice } from "components/custom-hook/streaming/useSetDevice"

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
   microphoneError: AgoraRTCReactError
   cameraError: AgoraRTCReactError
   fetchCamerasError: IAgoraRTCError
   fetchMicsError: IAgoraRTCError
   cameraDevices: MediaDeviceInfo[]
   microphoneDevices: MediaDeviceInfo[]
   localUser: LocalUser
   readyToPublish: boolean
}

const LocalTracksContext = createContext<LocalTracksContextProps | undefined>(
   undefined
)

export const LocalTracksProvider: FC<LocalTracksProviderProps> = ({
   children,
}) => {
   const streamingContextProps = useStreamingContext()
   const { isReady, shouldStream, currentRole } = streamingContextProps
   const currentUserUID = useCurrentUID()

   const [cameraOn, setCameraOn] = useState(true)

   const [microphoneMuted, setMicrophoneMuted] = useState(false)

   const {
      devices: cameras,
      error: fetchCamerasError,
      activeDeviceId: activeCameraId,
      setActiveDeviceId: setActiveCameraId,
   } = useDevices({
      deviceType: "camera",
      enable: shouldStream,
   })

   const {
      devices: microphones,
      error: fetchMicsError,
      activeDeviceId: activeMicrophoneId,
      setActiveDeviceId: setActiveMicrophoneId,
   } = useDevices({
      deviceType: "microphone",
      enable: shouldStream,
   })

   const cameraTrack = useLocalCameraTrack(shouldStream ? cameraOn : false)
   const microphoneTrack = useLocalMicrophoneTrack(shouldStream)

   /**
    * Uses the `activeCameraId` and `activeMicrophoneId` to set the active local devices
    * for the camera and microphone tracks.
    */
   useSetDevice(cameraTrack.localCameraTrack, activeCameraId)
   useSetDevice(microphoneTrack.localMicrophoneTrack, activeMicrophoneId)

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

   const readyToPublish = shouldStream && isReady && currentRole === "host"

   const localUser = useMemo<LocalUser>(
      () => /* If the user is ready to publish, return the local user object*/ ({
         type: "local-user",
         user: {
            uid: currentUserUID,
            hasAudio: !microphoneMuted,
            hasVideo: cameraOn,
            audioTrack: microphoneTrack.localMicrophoneTrack,
            videoTrack: cameraTrack.localCameraTrack,
         },
      }),
      [
         currentUserUID,
         microphoneMuted,
         cameraOn,
         microphoneTrack.localMicrophoneTrack,
         cameraTrack.localCameraTrack,
      ]
   )

   usePublish(
      [microphoneTrack.localMicrophoneTrack, cameraTrack.localCameraTrack],
      readyToPublish
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
         microphoneError: microphoneTrack.error,
         cameraError: cameraTrack.error,
         fetchCamerasError,
         fetchMicsError,
         cameraDevices: cameras,
         microphoneDevices: microphones,
         localUser,
         readyToPublish,
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
         setActiveCameraId,
         setActiveMicrophoneId,
         fetchMicsError,
         fetchCamerasError,
         cameras,
         microphones,
         localUser,
         readyToPublish,
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
