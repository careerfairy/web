import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ClientRole, useJoin, useRTCClient } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import { useAgoraRtcToken } from "components/custom-hook/streaming"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { useClientConfig } from "components/custom-hook/streaming/useClientConfig"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { livestreamService } from "data/firebase/LivestreamService"
import { DocumentReference } from "firebase/firestore"
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
import {
   useHasEnded,
   useHasStarted,
   useIsConnectedOnDifferentBrowser,
   useIsSpyMode,
   useSidePanel,
} from "store/selectors/streamingAppSelectors"

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
   currentRole: ClientRole
   // The livestream or breakout-room document reference
   streamRef: DocumentReference<LivestreamEvent>
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
   const hasStarted = useHasStarted()
   const hasEnded = useHasEnded()
   const isSpyMode = useIsSpyMode()

   const hostAuthToken = query.token?.toString() || null

   const { activeView } = useSidePanel()
   const isLoggedInOnDifferentBrowser = useIsConnectedOnDifferentBrowser()

   const {
      userHandRaiseIsActive: isUserHandRaiseActive,
      userCanJoinPanel: viewerCanJoinPanel,
   } = useUserHandRaiseState(livestreamId, agoraUserId)

   const dispatch = useAppDispatch()

   const isHandRaiseActive = activeView === ActiveViews.HAND_RAISE

   useEffect(() => {
      // if the user is not a host and the hand raise panel is active,
      // switch to chat
      if (!isHost && isHandRaiseActive) {
         dispatch(setActiveView(ActiveViews.CHAT))
      }
   }, [isHost, isHandRaiseActive, dispatch])

   const shouldStream = Boolean((isHost && !isSpyMode) || isUserHandRaiseActive)

   const response = useAgoraRtcToken({
      channelName: livestreamId,
      isStreamer: isHost,
      sentToken: isHost ? hostAuthToken : undefined,
      streamDocumentPath: `livestreams/${livestreamId}`,
      uid: agoraUserId,
   })

   const viewerCanJoin = (!isHost && !hasEnded && hasStarted) || isSpyMode

   const client = useRTCClient()

   const config = useClientConfig(client, {
      hostCondition: shouldStream && isReady && (isHost || viewerCanJoinPanel),
      enableDualStream: true,
   })

   const shouldJoinChannel =
      (isHost || viewerCanJoin) &&
      // Join channel if not logged in on another browser and token is available
      !isLoggedInOnDifferentBrowser &&
      !response.isLoading &&
      Boolean(response.token)

   const value = useMemo<StreamContextProps>(
      () => ({
         livestreamId,
         isHost,
         shouldStream: shouldStream,
         streamerAuthToken: hostAuthToken,
         agoraUserId,
         agoraUserToken: response.token,
         isReady,
         setIsReady,
         currentRole: config.currentRole,
         streamRef: livestreamService.getLivestreamRef(livestreamId),
      }),
      [
         livestreamId,
         isHost,
         shouldStream,
         hostAuthToken,
         agoraUserId,
         response.token,
         isReady,
         config.currentRole,
      ]
   )

   return (
      <StreamContext.Provider value={value}>
         {children}
         {Boolean(shouldJoinChannel) && (
            <JoinComponent
               livestreamId={livestreamId}
               agoraUserId={agoraUserId}
               joinToken={response.token}
            />
         )}
      </StreamContext.Provider>
   )
}
interface JoinComponentProps {
   livestreamId: string
   agoraUserId: string
   joinToken: string
}

/**
 * The `JoinComponent` utilizes the `useJoin` hook from the Agora React SDK, which automatically handles
 * joining the channel when the component mounts. It is crucial that this component unmounts properly
 * to ensure the user leaves the channel, preventing any session persistence issues.
 */
const JoinComponent = ({
   livestreamId,
   agoraUserId,
   joinToken,
}: JoinComponentProps) => {
   useJoin({
      appid: agoraCredentials.appID,
      channel: livestreamId,
      token: joinToken,
      uid: agoraUserId,
   })
   return null
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
