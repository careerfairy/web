import AgoraRTC, {
   CameraVideoTrackInitConfig,
   ClientConfig,
   IAgoraRTCClient,
   ICameraVideoTrack,
   IMicrophoneAudioTrack,
   MicrophoneAudioTrackInitConfig,
} from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import { RTCError } from "../../types/streaming"

export class AgoraService {
   constructor() {}

   /**
    * Initializes a Web SDK client and stores the instance for the lifecycle of the application
    * @param config Configuration for the Web SDK Client instance
    * @returns React hook that gives access to the Web SDK Client instance
    * @category Wrapper
    */
   createClient(config: ClientConfig) {
      let client: IAgoraRTCClient

      function createClosure() {
         if (!client) {
            client = AgoraRTC.createClient(config)
         }
         return client
      }

      return () => createClosure()
   }

   createMicrophoneAndCameraTracks(
      audioConfig?: MicrophoneAudioTrackInitConfig | undefined,
      videoConfig?: CameraVideoTrackInitConfig | undefined
   ) {
      let tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null

      async function createClosure() {
         tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
            audioConfig,
            videoConfig
         )
         return tracks
      }

      return function useMicrophoneAndCameraTracks() {
         const [ready, setReady] = useState(false)
         const [agoraRTCError, setAgoraRTCError] = useState<null | RTCError>(
            null
         )
         const ref = useRef(tracks)

         useEffect(() => {
            if (ref.current === null) {
               createClosure().then(
                  (tracks) => {
                     ref.current = tracks
                     setReady(true)
                  },
                  (e) => {
                     setAgoraRTCError(e)
                  }
               )
            } else {
               setReady(true)
            }
            return () => {
               tracks = null
            }
         }, [])
         return { ready, tracks: ref.current, error: agoraRTCError }
      }
   }
}

export const agoraServiceInstance = new AgoraService()

export default AgoraService
