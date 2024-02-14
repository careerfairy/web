import { useJoin, useRTCClient } from "agora-rtc-react"
import { useAppDispatch, useAppSelector } from "components/custom-hook/store"
import { useAgoraRtcToken } from "components/custom-hook/streaming"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { useRouter } from "next/router"
import {
   FC,
   ReactNode,
   createContext,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { sidePanelSelector } from "store/selectors/streamingAppSelectors"
import { errorLogAndNotify } from "util/CommonUtil"

type StreamContextProps = {
   livestreamId: string
   isHost: boolean
   // If the user should be streaming
   shouldStream: boolean
   // The token gotten from the url /streaming/host/[streamId]?token="1234"
   streamerAuthToken: string
   // The user's stream id, used to identify the user in the agora stream
   agoraUserId: string
   // The token gotten from the agora cloud function
   agoraUserToken: string
   // Whether the user is ready to start streaming
   isReady: boolean
   setIsReady: (isReady: boolean) => void
   isJoining: boolean
}

const StreamContext = createContext<StreamContextProps | undefined>(undefined)

type StreamProviderProps = {
   children: ReactNode
   livestreamId: string
   isHost: boolean
   agoraUserId: string
}

export const StreamingProvider: FC<StreamProviderProps> = ({
   livestreamId,
   isHost,
   agoraUserId,
   children,
}) => {
   const { query } = useRouter()
   const [isReady, setIsReady] = useState(false)

   const hostAuthToken = query.token?.toString() || ""

   const { activeView } = useAppSelector(sidePanelSelector)

   const dispatch = useAppDispatch()

   const isHandRaiseActive = activeView === ActiveViews.HAND_RAISE

   useEffect(() => {
      // if the user is not a host and the hand raise panel is active,
      // switch to chat
      if (!isHost && isHandRaiseActive) {
         dispatch(setActiveView(ActiveViews.CHAT))
      }
   }, [isHost, isHandRaiseActive, dispatch])

   const shouldStream = isHost
   // TODO: OR Viewer has raised their hand and the host has accepted them

   const response = useAgoraRtcToken({
      channelName: livestreamId,
      isStreamer: shouldStream,
      sentToken: isHost ? hostAuthToken : undefined,
      streamDocumentPath: `livestreams/${livestreamId}`,
      uid: agoraUserId,
   })

   const { isLoading, isConnected } = useJoin({
      appid: agoraCredentials.appID,
      channel: livestreamId,
      token: response.token,
      uid: agoraUserId,
   })

   const client = useRTCClient()

   useEffect(() => {
      client.enableDualStream().catch(errorLogAndNotify)
   }, [client, shouldStream])

   useEffect(() => {
      if (isConnected) {
         client.setClientRole(shouldStream ? "host" : "audience")
      }
   }, [client, isConnected, shouldStream])

   useEffect(() => {
      if (isConnected) {
         client.enableAudioVolumeIndicator()
      }
   }, [client, isConnected])

   const value = useMemo<StreamContextProps>(
      () => ({
         livestreamId,
         isHost,
         shouldStream: isHost ? true : shouldStream,
         streamerAuthToken: hostAuthToken,
         agoraUserId,
         agoraUserToken: response.token,
         isReady,
         setIsReady,
         isJoining: isLoading,
      }),
      [
         livestreamId,
         isHost,
         shouldStream,
         hostAuthToken,
         agoraUserId,
         response.token,
         isReady,
         isLoading,
      ]
   )

   return (
      <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
   )
}

export const useStreamingContext = () => {
   const context = useContext(StreamContext)
   if (context === undefined) {
      throw new Error(
         "useStreamingContext must be used within a StreamProvider"
      )
   }
   return context
}
