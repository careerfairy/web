import React, {
   ReactNode,
   createContext,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useCurrentUID, useIsConnected } from "agora-rtc-react"
import { useStreamingContext } from "./Streaming"
import { createLazyChannel, createLazyClient } from "./rtm/util"
import { agoraCredentials } from "data/agora/AgoraInstance"
import AgoraRTM from "agora-rtm-sdk"
import { useAgoraRtmToken } from "components/custom-hook/streaming/useAgoraRtmToken"
import { errorLogAndNotify } from "util/CommonUtil"
import { AgoraRTMChannelProvider, AgoraRTMClientProvider } from "./rtm"

const useClient = createLazyClient()
const useChannel = createLazyChannel()

type RTMSignalingContextType = {
   isLoggedIn: boolean
}

const RTMContext = createContext<RTMSignalingContextType | null>(null)

type RTMSignalingProviderProps = {
   children: ReactNode
}

export const RTMSignalingProvider = ({
   children,
}: RTMSignalingProviderProps) => {
   const { livestreamId } = useStreamingContext()
   const rtcIsConnected = useIsConnected()
   const uid = useCurrentUID()

   const [loggedIn, setLoggedIn] = useState(false)

   const client = useClient(agoraCredentials.appID, {
      enableCloudProxy: false,
      logFilter: AgoraRTM.LOG_FILTER_INFO,
   })

   const channel = useChannel(client, livestreamId)

   const { token } = useAgoraRtmToken(rtcIsConnected ? uid.toString() : null)

   const login = useCallback(async () => {
      try {
         await client.login({ uid: uid.toString(), token })
         await channel.join()
         setLoggedIn(true)
      } catch (e) {
         errorLogAndNotify(e, {
            message: "Failed to login to Agora RTM",
            metadata: {
               uid: uid,
               token,
            },
         })
      }
   }, [channel, client, token, uid])

   const logout = useCallback(async () => {
      try {
         await channel.leave()
         await client.logout()
         channel.removeAllListeners()
         client.removeAllListeners()
         setLoggedIn(false)
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

   // Todo: Dispatch emote locally
   // const sendEmote = async (text: string) => {
   //   const message = client.createMessage({ text, messageType: "TEXT" })
   //   await channel.sendMessage(message)
   // }

   const value = useMemo<RTMSignalingContextType>(
      () => ({
         isLoggedIn: loggedIn,
      }),
      [loggedIn]
   )

   return (
      <RTMContext.Provider value={value}>
         <AgoraRTMClientProvider client={client}>
            <AgoraRTMChannelProvider channel={channel}>
               {children}
            </AgoraRTMChannelProvider>
         </AgoraRTMClientProvider>
      </RTMContext.Provider>
   )
}
