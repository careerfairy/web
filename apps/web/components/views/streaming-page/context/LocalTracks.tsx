import {
   AgoraRTCReactError,
   IAgoraRTCError,
   useCurrentUID,
   useLocalCameraTrack,
   useLocalMicrophoneTrack,
   usePublish,
   useRTCClient,
} from "agora-rtc-react"
import { useHandleHandRaise } from "components/custom-hook/streaming/hand-raise/useHandleHandRaise"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { useOptimisedLocalStream } from "components/custom-hook/streaming/useOptimisedLocalStream"
import { useTrackHandler } from "components/custom-hook/streaming/useTrackHandler"
import { getVideoEncoderPreset } from "context/agora/RTCProvider"
import { useRouter } from "next/router"
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
import { useIsConnectedOnDifferentBrowser } from "store/selectors/streamingAppSelectors"
import { useNoiseSuppression } from "../hooks/useNoiseSuppression"
import { type LocalUser } from "../types"
import { useAgoraDevices } from "./AgoraDevices"
import { useStreamingContext } from "./Streaming"

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
   noiseSuppressionEnabled: boolean
   isNoiseSuppressionSupported: boolean
   toggleNoiseSuppression: () => void
}

const LocalTracksContext = createContext<LocalTracksContextProps | undefined>(
   undefined
)

export const LocalTracksProvider: FC<LocalTracksProviderProps> = ({
   children,
}) => {
   const {
      query: { withHighQuality },
   } = useRouter()
   const isConnectedOnDifferentBrowser = useIsConnectedOnDifferentBrowser()
   const streamingContextProps = useStreamingContext()
   const { isReady, shouldStream, currentRole } = streamingContextProps
   const currentUserUID = useCurrentUID()

   const [cameraOn, setCameraOn] = useState(true)
   const [microphoneMuted, setMicrophoneMuted] = useState(false)

   const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(true)

   const { cameras, microphones, fetchCamerasError, fetchMicsError } =
      useAgoraDevices()

   const firstCameraId = cameras?.[0]?.deviceId
   const firstMicId = microphones?.[0]?.deviceId

   const { userCanJoinPanel: viewerCanJoinPanel } = useUserHandRaiseState(
      streamingContextProps.livestreamId,
      streamingContextProps.agoraUserId
   )

   useEffect(() => {
      if (isConnectedOnDifferentBrowser) {
         setCameraOn(false)
         setMicrophoneMuted(true)
      }
   }, [isConnectedOnDifferentBrowser])

   const cameraTrack = useLocalCameraTrack(
      shouldStream ? Boolean(cameraOn && firstCameraId) : false,
      {
         cameraId: firstCameraId,
         encoderConfig: getVideoEncoderPreset(withHighQuality),
      }
   )

   const micReady = Boolean(shouldStream && firstMicId)
   const microphoneTrack = useLocalMicrophoneTrack(micReady, {
      microphoneId: firstMicId,
      encoderConfig: withHighQuality ? "high_quality_stereo" : undefined,
   })

   const { isCompatible } = useNoiseSuppression(
      microphoneTrack.localMicrophoneTrack,
      {
         enabled: noiseSuppressionEnabled,
      }
   )

   const {
      activeDeviceId: activeMicrophoneId,
      handleSetActiveDevice: setActiveMicrophoneId,
   } = useTrackHandler("microphone", microphoneTrack.localMicrophoneTrack)

   const {
      activeDeviceId: activeCameraId,
      handleSetActiveDevice: setActiveCameraId,
   } = useTrackHandler("camera", cameraTrack.localCameraTrack)

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

   const readyToPublish =
      shouldStream &&
      isReady &&
      currentRole === "host" &&
      (streamingContextProps.isHost || viewerCanJoinPanel)

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

   const toggleNoiseSuppression = useCallback(() => {
      setNoiseSuppressionEnabled((prev) => !prev)
   }, [])

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
         noiseSuppressionEnabled,
         isNoiseSuppressionSupported: isCompatible,
         toggleNoiseSuppression,
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
         noiseSuppressionEnabled,
         toggleNoiseSuppression,
         isCompatible,
      ]
   )

   return (
      <LocalTracksContext.Provider value={value}>
         {children}
         {Boolean(readyToPublish) && (
            <PublishComponent
               microphoneTrack={microphoneTrack}
               cameraTrack={cameraTrack}
            />
         )}
      </LocalTracksContext.Provider>
   )
}

type PublishComponentProps = {
   microphoneTrack: ReturnType<typeof useLocalMicrophoneTrack>
   cameraTrack: ReturnType<typeof useLocalCameraTrack>
}

const PublishComponent = ({
   microphoneTrack,
   cameraTrack,
}: PublishComponentProps) => {
   const { livestreamId, agoraUserId, isHost } = useStreamingContext()
   const rtcClient = useRTCClient()

   const { error, isLoading } = usePublish([
      microphoneTrack.localMicrophoneTrack,
      cameraTrack.localCameraTrack,
   ])

   /* agora-rtc-react has some issues with publishing enabled tracks that start as disabled,
    * so this effect assures everything goes smoothly when turning mic and camera on/off */
   useEffect(() => {
      let isCameraPublished = false
      let isMicPublished = false

      const interval = setInterval(() => {
         if (cameraTrack.localCameraTrack?.enabled && !isCameraPublished) {
            rtcClient
               .publish(cameraTrack.localCameraTrack)
               .then(() => {
                  isCameraPublished = true
               })
               .catch(console.error)
         }
         if (microphoneTrack.localMicrophoneTrack?.enabled && !isMicPublished) {
            rtcClient
               .publish(microphoneTrack.localMicrophoneTrack)
               .then(() => {
                  isMicPublished = true
               })
               .catch(console.error)
         }
      }, 1000)

      return () => {
         clearInterval(interval)
         rtcClient.unpublish(cameraTrack.localCameraTrack).then(() => {
            isCameraPublished = false
         })
         rtcClient.unpublish(microphoneTrack.localMicrophoneTrack).then(() => {
            isMicPublished = false
         })
      }
   }, [
      cameraTrack.localCameraTrack,
      rtcClient,
      microphoneTrack.localMicrophoneTrack,
   ])

   useOptimisedLocalStream(cameraTrack.localCameraTrack, true)

   useHandleHandRaise({
      livestreamId,
      agoraUserId,
      disabled: isHost,
      isPublishingTracks: isLoading,
      error,
   })

   return null
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
