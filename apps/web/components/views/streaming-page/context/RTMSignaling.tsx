import { useCurrentUID, useIsConnected } from "agora-rtc-react"
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk"
import { useAppDispatch } from "components/custom-hook/store"
import { useAgoraRtmToken } from "components/custom-hook/streaming/useAgoraRtmToken"
import { useForcedProxyMode } from "components/custom-hook/streaming/useForcedProxyMode"
import { EmoteType } from "context/agora/RTMContext"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { setRTMFailedToConnect } from "store/reducers/streamingAppReducer"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "./Streaming"
import { AgoraRTMChannelProvider, AgoraRTMClientProvider } from "./rtm"

type RTMSignalingProviderProps = {
   children: ReactNode
}

type RTMState = {
   client: RtmClient | null
   channel: RtmChannel | null
}

export const RTMSignalingProvider = ({
   children,
}: RTMSignalingProviderProps) => {
   const forcedProxyMode = useForcedProxyMode()

   const { livestreamId } = useStreamingContext()
   const rtcIsConnected = useIsConnected()
   const uid = useCurrentUID()
   const dispatch = useAppDispatch()

   const [rtmState, setRtmState] = useState<RTMState>({
      client: null,
      channel: null,
   })

   const { token } = useAgoraRtmToken(
      rtcIsConnected && uid ? uid.toString() : null
   )

   const enableCloudProxy = Boolean(forcedProxyMode)

   const login = useCallback(async () => {
      try {
         const newClient = AgoraRTM.createInstance(agoraCredentials.appID, {
            enableCloudProxy,
         })
         await newClient.login({ uid: uid.toString(), token })
         const newChannel = newClient.createChannel(livestreamId)
         await newChannel.join()
         setRtmState({ channel: newChannel, client: newClient })
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
   }, [dispatch, enableCloudProxy, livestreamId, token, uid])

   const logout = useCallback(async () => {
      try {
         setRtmState((prev) => {
            prev.channel?.leave()
            prev.channel?.removeAllListeners()
            prev.client?.logout()
            prev.client?.removeAllListeners()
            return { channel: null, client: null }
         })
      } catch (e) {
         errorLogAndNotify(e, {
            message: "Failed to logout from Agora RTM",
         })
      }
   }, [])

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
      const message = rtmState?.client.createMessage({
         text: emoteType,
         messageType: "TEXT",
      })
      // 1. Optimistically dispatch emote locally to the UI

      // 2. Emit the emote event into the signaling API
      await rtmState?.channel.sendMessage(message)

      // 3. Save the emote document in firestore
   }

   return (
      <AgoraRTMClientProvider client={rtmState.client}>
         <AgoraRTMChannelProvider channel={rtmState.channel}>
            {children}
         </AgoraRTMChannelProvider>
      </AgoraRTMClientProvider>
   )
}
