import { Box, Button, ButtonGroup } from "@mui/material"
import { useCurrentUID, useIsConnected } from "agora-rtc-react"
import { useAgoraRtmToken } from "components/custom-hook/streaming/useAgoraRtmToken"
import { EmoteType } from "context/agora/RTMContext"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { useSnackbar } from "notistack"
import {
   ReactNode,
   createContext,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "./Streaming"
import {
   AgoraRTMChannelProvider,
   AgoraRTMClientProvider,
   useRTMChannelEvent,
} from "./rtm"
import { createRTMClient, createLazyRTMChannel } from "./rtm/util"

const useClient = createRTMClient(agoraCredentials.appID)
const useChannel = createLazyRTMChannel()

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
   const { enqueueSnackbar } = useSnackbar()
   const rtcIsConnected = useIsConnected()
   const uid = useCurrentUID()

   const [loggedIn, setLoggedIn] = useState(false)

   const client = useClient()

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

   /**
    * Todos:
    * 1. Optimistically dispatch emote locally to the UI
    * 2. On successful send, save emote to the database
    */
   const sendEmote = async (emoteType: EmoteType) => {
      const message = client.createMessage({
         text: emoteType,
         messageType: "TEXT",
      })
      await channel.sendMessage(message)
   }

   useRTMChannelEvent(channel, "ChannelMessage", (message, memberId) => {
      enqueueSnackbar(`Emote sent by ${memberId}: ${message.text}`, {
         variant: "success",
      })
   })

   useRTMChannelEvent(channel, "MemberCountUpdated", (newCount) => {
      console.log("MemberCountUpdated 🚀", newCount)
   })

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
               <Box position="absolute" p={2} top={0} right={0}>
                  <ButtonGroup>
                     <Button
                        variant="contained"
                        onClick={() => sendEmote("clapping")}
                     >
                        Clap
                     </Button>
                     <Button
                        variant="contained"
                        onClick={() => sendEmote("heart")}
                     >
                        Heart
                     </Button>
                  </ButtonGroup>
               </Box>
            </AgoraRTMChannelProvider>
         </AgoraRTMClientProvider>
      </RTMContext.Provider>
   )
}
