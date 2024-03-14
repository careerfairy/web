import { useCurrentUID, useIsConnected } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import { useAgoraRtmToken } from "components/custom-hook/streaming/useAgoraRtmToken"
import { EmoteType } from "context/agora/RTMContext"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { ReactNode, useCallback, useEffect } from "react"
import { setRTMFailedToConnect } from "store/reducers/streamingAppReducer"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "./Streaming"
import {
   AgoraRTMChannelProvider,
   AgoraRTMClientProvider,
   createLazyRTMChannel,
   createRTMClient,
} from "./rtm"

const useChannel = createLazyRTMChannel()
const useClient = createRTMClient(agoraCredentials.appID)

type RTMSignalingProviderProps = {
   children: ReactNode
}

export const RTMSignalingProvider = ({
   children,
}: RTMSignalingProviderProps) => {
   const { livestreamId } = useStreamingContext()
   const rtcIsConnected = useIsConnected()
   const uid = useCurrentUID()
   const dispatch = useAppDispatch()

   const client = useClient()
   const channel = useChannel(client, livestreamId)

   const { token } = useAgoraRtmToken(rtcIsConnected ? uid.toString() : null)

   const login = useCallback(async () => {
      try {
         await client.login({ uid: uid.toString(), token })
         await channel.join()
         dispatch(setRTMFailedToConnect(false))
      } catch (e) {
         dispatch(setRTMFailedToConnect(true))
         errorLogAndNotify(e, {
            message: "Failed to login to Agora RTM",
            metadata: {
               uid: uid,
               token,
            },
         })
      }
   }, [channel, client, dispatch, token, uid])

   // Reset the failed to connect state when the component unmounts
   useEffect(() => {
      return () => {
         dispatch(setRTMFailedToConnect(false))
      }
   }, [dispatch])

   const logout = useCallback(async () => {
      try {
         await channel.leave()
         await client.logout()
         channel.removeAllListeners()
         client.removeAllListeners()
      } catch (e) {
         errorLogAndNotify(e, {
            message: "Failed to logout from Agora RTM",
         })
      }
   }, [channel, client])

   useEffect(() => {
      if (token) {
         login()

         return () => {
            logout()
         }
      }
   }, [login, logout, token])

   /**
    * For demo purposes, will be moved to the emotes button
    */
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const sendEmote = async (emoteType: EmoteType) => {
      const message = client.createMessage({
         text: emoteType,
         messageType: "TEXT",
      })
      // 1. Optimistically dispatch emote locally to the UI

      // 2. Emit the emote event into the signaling API
      await channel.sendMessage(message)

      // 3. Save the emote document in firestore
   }

   return (
      <AgoraRTMClientProvider client={client}>
         <AgoraRTMChannelProvider channel={channel}>
            {children}
         </AgoraRTMChannelProvider>
      </AgoraRTMClientProvider>
   )
}
