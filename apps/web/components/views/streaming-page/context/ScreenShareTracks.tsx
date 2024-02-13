import type {
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
import {
   useAgoraRtcToken,
   useLivestreamData,
} from "components/custom-hook/streaming"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { STREAM_IDENTIFIERS } from "constants/streaming"
import { agoraCredentials } from "data/agora/AgoraInstance"
import {
   ReactNode,
   createContext,
   memo,
   // useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useStreamingContext } from "."
import { useRouter } from "next/router"

interface ScreenShareProviderProps {
   children: ReactNode
}

type ScreenShareTracksContextProps = {
   screenShareOn: boolean
   setScreenShareOn: (on: boolean) => void
   screenShareUID: string
   screenVideoTrack: ILocalVideoTrack | null
   screenAudioTrack: ILocalAudioTrack | null
}

const ScreenShareTracksContext = createContext<
   ScreenShareTracksContextProps | undefined
>(undefined)

export const ScreenShareProvider = ({ children }: ScreenShareProviderProps) => {
   const [screenShareOn, setScreenShareOn] = useState(false)

   const { agoraUserToken, livestreamId, shouldStream } = useStreamingContext()

   const localScreenTrack = useLocalScreenTrack(
      shouldStream ? screenShareOn : false,
      {},
      "enable"
   )
   const client = useRTCScreenShareClient()
   const userUID = useCurrentUID()

   //screen share
   const [screenVideoTrack, setScreenVideoTrack] =
      useState<ILocalVideoTrack | null>(null)
   const [screenAudioTrack, setScreenAudioTrack] =
      useState<ILocalAudioTrack | null>(null)

   const screenShareUID = `${STREAM_IDENTIFIERS.SCREEN_SHARE}-${userUID}`

   const { query } = useRouter()

   const hostAuthToken = query.token?.toString() || ""
   //join room

   const { trigger: setLivestreamMode } = useSetLivestreamMode(livestreamId)

   const response = useAgoraRtcToken(
      {
         channelName: livestreamId,
         isStreamer: true,
         sentToken: hostAuthToken,
         streamDocumentPath: `livestreams/${livestreamId}`,
         uid: screenShareUID,
      },
      true
   )

   const { isConnected } = useJoin(
      {
         appid: agoraCredentials.appID,
         channel: livestreamId,
         token: response.token,
         uid: screenShareUID,
      },
      screenShareOn,
      client
   )
   console.log("🚀 ~ agoraUserToken Token", agoraUserToken)
   console.log("🚀 ~ screen Token", response.token)

   //publish screen share
   usePublish([screenVideoTrack, screenAudioTrack], screenShareOn, client)

   useEffect(() => {
      if (isConnected) {
         console.log("🚀 setting livestream mode")
         setLivestreamMode({
            mode: LivestreamModes.DESKTOP,
            screenSharerAgoraUID: screenShareUID,
         })
      }
   }, [isConnected, screenShareUID, setLivestreamMode])

   //get screen share video track and audio track
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

   const value = useMemo<ScreenShareTracksContextProps>(
      () => ({
         screenVideoTrack,
         screenAudioTrack,
         screenShareOn,
         setScreenShareOn,
         screenShareUID,
      }),
      [screenVideoTrack, screenAudioTrack, screenShareOn, screenShareUID]
   )

   return (
      <ScreenShareTracksContext.Provider value={value}>
         {children}
         <ScreenShareTracker />
      </ScreenShareTracksContext.Provider>
   )
}

const ScreenShareTracker = memo(function ScreenShareTracker() {
   // const { livestreamId } = useStreamingContext()
   const { screenSharerId } = useLivestreamData()
   const { screenShareUID, setScreenShareOn, screenVideoTrack } =
      useScreenShareTracks()

   // const { trigger: setLivestreamMode } = useSetLivestreamMode(livestreamId)

   // const handleStopScreenShare = useCallback(() => {
   //    setLivestreamMode({
   //       mode: LivestreamModes.DEFAULT,
   //    })
   //    setScreenShareOn(false)
   // }, [setLivestreamMode, setScreenShareOn])

   //screen share closed
   useTrackEvent(screenVideoTrack, "track-ended", () => {
      console.log("screen sharing track ended")
      // handleStopScreenShare()
   })

   useEffect(() => {
      if (screenSharerId && screenSharerId !== screenShareUID) {
         // setScreenShareOn(false)
      }
   }, [screenShareUID, screenSharerId, setScreenShareOn])

   return null
})

export const useScreenShareTracks = () => {
   const context = useContext(ScreenShareTracksContext)
   if (!context) {
      throw new Error(
         "useScreenShareTracks must be used within a ScreenShareProvider"
      )
   }
   return context
}
