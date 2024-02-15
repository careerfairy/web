import type {
   AgoraRTCReactError,
   ILocalAudioTrack,
   ILocalTrack,
   ILocalVideoTrack,
} from "agora-rtc-react"

import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import {
   useCurrentUID,
   useJoin,
   useLocalScreenTrack,
   usePublish,
   useRTCScreenShareClient,
   useTrackEvent,
} from "agora-rtc-react"
import { useAgoraRtcToken } from "components/custom-hook/streaming"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { STREAM_IDENTIFIERS } from "constants/streaming"
import { agoraCredentials } from "data/agora/AgoraInstance"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useStreamingContext } from "."
import { useRouter } from "next/router"
import { useClientConfig } from "components/custom-hook/streaming/useClientConfig"
import { LocalUserScreen } from "../types"

interface ScreenShareProviderProps {
   children: ReactNode
}

type ScreenShareContextProps = {
   /** Wether the user has locally started the screen sharing process */
   screenShareOn: boolean
   /** Function to stop any screen sharing */
   handleStopScreenShare: () => void
   /** Function to start the screen sharing process */
   handleStartScreenShareProcess: () => void
   /** Unique identifier for the screen sharing session */
   screenShareUID: string
   /** The video track of the screen sharing session */
   screenVideoTrack: ILocalVideoTrack | null
   /** The audio track of the screen sharing session */
   screenAudioTrack: ILocalAudioTrack | null
   /**
    * The local user's screen share stream
    */
   localUserScreen: LocalUserScreen
   screenShareError: AgoraRTCReactError | null
   isLoadingScreenShare: boolean
   readyToPublish: boolean
}

const ScreenShareContext = createContext<ScreenShareContextProps | undefined>(
   undefined
)

export const ScreenShareProvider = ({ children }: ScreenShareProviderProps) => {
   const [screenShareOn, setScreenShareOn] = useState(false)

   const { livestreamId, shouldStream } = useStreamingContext()

   const client = useRTCScreenShareClient()

   const localScreenTrack = useLocalScreenTrack(
      shouldStream ? screenShareOn : false,
      {},
      "auto",
      client
   )

   const userUID = useCurrentUID()

   const [screenVideoTrack, setScreenVideoTrack] =
      useState<ILocalVideoTrack | null>(null)
   const [screenAudioTrack, setScreenAudioTrack] =
      useState<ILocalAudioTrack | null>(null)

   const [screenShareError, setScreenShareError] =
      useState<null | AgoraRTCReactError>(null)

   const screenShareUID = `${STREAM_IDENTIFIERS.SCREEN_SHARE}-${userUID}`

   const { query } = useRouter()

   const hostAuthToken = query.token?.toString() || ""

   const { trigger: setLivestreamMode } = useSetLivestreamMode(livestreamId)

   const response = useAgoraRtcToken(
      screenShareOn
         ? {
              channelName: livestreamId,
              isStreamer: true,
              sentToken: hostAuthToken,
              streamDocumentPath: `livestreams/${livestreamId}`,
              uid: screenShareUID,
           }
         : null
   )

   const handleStopScreenShare = useCallback(() => {
      setLivestreamMode({
         mode: LivestreamModes.DEFAULT,
      })
      setScreenShareOn(false)
   }, [setLivestreamMode, setScreenShareOn])

   const handleStartScreenShareProcess = useCallback(() => {
      setScreenShareOn(true)
   }, [setScreenShareOn])

   useJoin(
      {
         appid: agoraCredentials.appID,
         channel: livestreamId,
         token: response.token,
         uid: screenShareUID,
      },
      Boolean(screenShareOn && response.token),
      client
   )

   const hasSelectedScreen = Boolean(screenVideoTrack)

   const { currentRole } = useClientConfig(client, {
      hostCondition: shouldStream && hasSelectedScreen,
   })

   const readyToPublish = Boolean(
      screenShareOn && hasSelectedScreen && currentRole === "host"
   )

   usePublish([screenVideoTrack, screenAudioTrack], readyToPublish, client)

   useEffect(() => {
      if (readyToPublish) {
         setLivestreamMode({
            mode: LivestreamModes.DESKTOP,
            screenSharerAgoraUID: screenShareUID,
         })
      }
   }, [readyToPublish, screenShareUID, setLivestreamMode])

   useEffect(() => {
      if (localScreenTrack.error) {
         // True if the user clicked "cancel" in the screen share popup
         const userCancelledScreenShare =
            localScreenTrack.error.message ===
            "AgoraRTCError PERMISSION_DENIED: NotAllowedError: Permission denied"

         setScreenShareError(
            userCancelledScreenShare ? null : localScreenTrack.error
         )

         // If getting the screen track fails, stop the screen share process
         setScreenShareOn(false)
      }
   }, [localScreenTrack.error])

   useTrackEvent(screenVideoTrack, "track-ended", handleStopScreenShare)

   /**
    * Manages screen video and audio tracks based on user selections:
    * - If "share audio" is selected, `useLocalScreenTrack` returns an array of video and audio tracks.
    * - Without "share audio" selected, it returns only a video track (not in an array).
    */
   useEffect(() => {
      if (!localScreenTrack.screenTrack) {
         setScreenAudioTrack(null)
         setScreenVideoTrack(null)
      } else {
         if (Array.isArray(localScreenTrack.screenTrack)) {
            setScreenVideoTrack(
               localScreenTrack.screenTrack.filter(
                  (track: ILocalTrack) => track.trackMediaType === "video"
               )[0] as ILocalVideoTrack
            )
            setScreenAudioTrack(
               localScreenTrack.screenTrack.filter(
                  (track: ILocalTrack) => track.trackMediaType === "audio"
               )[0] as ILocalAudioTrack
            )
         } else {
            setScreenVideoTrack(localScreenTrack.screenTrack)
         }
      }
   }, [localScreenTrack.screenTrack])

   const localUserScreen = useMemo<LocalUserScreen>(
      () => ({
         type: "local-user-screen",
         user: {
            uid: screenShareUID,
            videoTrack: screenVideoTrack,
            audioTrack: screenAudioTrack,
            hasAudio: Boolean(screenAudioTrack),
            hasVideo: Boolean(screenVideoTrack),
         },
      }),
      [screenAudioTrack, screenShareUID, screenVideoTrack]
   )

   const value = useMemo<ScreenShareContextProps>(
      () => ({
         screenVideoTrack,
         screenAudioTrack,
         screenShareOn,
         screenShareUID,
         handleStopScreenShare,
         handleStartScreenShareProcess,
         localUserScreen,
         screenShareError,
         isLoadingScreenShare: localScreenTrack.isLoading,
         readyToPublish,
      }),
      [
         screenVideoTrack,
         screenAudioTrack,
         screenShareOn,
         screenShareUID,
         handleStopScreenShare,
         handleStartScreenShareProcess,
         localUserScreen,
         screenShareError,
         localScreenTrack.isLoading,
         readyToPublish,
      ]
   )

   return (
      <ScreenShareContext.Provider value={value}>
         {children}
      </ScreenShareContext.Provider>
   )
}

export const useScreenShare = () => {
   const context = useContext(ScreenShareContext)
   if (context === undefined) {
      throw new Error(
         "useScreenShareTracks must be used within a ScreenShareProvider"
      )
   }
   return context
}
