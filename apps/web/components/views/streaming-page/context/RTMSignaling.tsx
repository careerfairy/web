import { Box, Button, ButtonGroup } from "@mui/material"
import { useCurrentUID, useIsConnected } from "agora-rtc-react"
import { useAgoraRtmToken } from "components/custom-hook/streaming/useAgoraRtmToken"
import { EmoteType } from "context/agora/RTMContext"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { useSnackbar } from "notistack"
import { ReactNode, useCallback, useEffect } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "./Streaming"
import {
   AgoraRTMChannelProvider,
   AgoraRTMClientProvider,
   createLazyRTMChannel,
   createRTMClient,
   useRTMChannelEvent,
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
   const { enqueueSnackbar } = useSnackbar()
   const rtcIsConnected = useIsConnected()
   const uid = useCurrentUID()

   const client = useClient()
   const channel = useChannel(client, livestreamId)

   const { token } = useAgoraRtmToken(rtcIsConnected ? uid.toString() : null)

   const login = useCallback(async () => {
      try {
         await client.login({ uid: uid.toString(), token })
         await channel.join()
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
    * For demo purposes
    */
   const sendEmote = async (emoteType: EmoteType) => {
      const message = client.createMessage({
         text: emoteType,
         messageType: "TEXT",
      })
      // 1. Optimistically dispatch emote locally to the UI
      enqueueSnackbar(emoteType, {
         variant: "success",
         anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
         },
         autoHideDuration: 2000,
      })
      // 2. Emit the emote event into the signaling API
      await channel.sendMessage(message)

      // 3. Save the emote document in firestore
   }

   /**
    * For demo purposes
    */
   useRTMChannelEvent(channel, "ChannelMessage", (message, memberId) => {
      enqueueSnackbar(`${message.text} - ${memberId}`, {
         variant: "success",
         anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
         },
         autoHideDuration: 2000,
      })
   })

   return (
      <AgoraRTMClientProvider client={client}>
         <AgoraRTMChannelProvider channel={channel}>
            {children}
            <Box position="absolute" p={2} bottom={0} left={0}>
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
   )
}
