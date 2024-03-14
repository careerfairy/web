import { Box, Button, ButtonGroup } from "@mui/material"
import { useCurrentUID, useIsConnected } from "agora-rtc-react"
import { useAgoraRtmToken } from "components/custom-hook/streaming/useAgoraRtmToken"
import { EmoteType } from "context/agora/RTMContext"
import { agoraCredentials } from "data/agora/AgoraInstance"
import { useSnackbar } from "notistack"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useStreamingContext } from "./Streaming"
import {
   AgoraRTMChannelProvider,
   AgoraRTMClientProvider,
   useRTMChannelEvent,
} from "./rtm"
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk"

type RTMSignalingProviderProps = {
   children: ReactNode
}

type RTMState = {
   channel: RtmChannel
   client: RtmClient
}

export const RTMSignalingProvider = ({
   children,
}: RTMSignalingProviderProps) => {
   const { livestreamId } = useStreamingContext()
   const { enqueueSnackbar } = useSnackbar()
   const rtcIsConnected = useIsConnected()
   const uid = useCurrentUID()

   const [rtmState, setRtmState] = useState<RTMState | null>(null)

   const { token } = useAgoraRtmToken(rtcIsConnected ? uid.toString() : null)

   const login = useCallback(async () => {
      try {
         const newClient = AgoraRTM.createInstance(agoraCredentials.appID)
         await newClient.login({ uid: uid.toString(), token })
         const newChannel = newClient.createChannel(livestreamId)
         await newChannel.join()
         setRtmState({ channel: newChannel, client: newClient })
      } catch (e) {
         errorLogAndNotify(e, {
            message: "Failed to login to Agora RTM",
            metadata: {
               uid: uid,
               token,
            },
         })
      }
   }, [livestreamId, token, uid])

   const logout = useCallback(async () => {
      try {
         setRtmState((prev) => {
            prev?.channel.leave()
            prev?.channel.removeAllListeners()
            prev?.client.logout()
            prev?.client.removeAllListeners()
            return null
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
    * For demo purposes
    */
   const sendEmote = async (emoteType: EmoteType) => {
      const message = rtmState?.client.createMessage({
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
      await rtmState?.channel.sendMessage(message)

      // 3. Save the emote document in firestore
   }

   /**
    * For demo purposes
    */
   useRTMChannelEvent(
      rtmState?.channel,
      "ChannelMessage",
      (message, memberId) => {
         enqueueSnackbar(`${message.text} - ${memberId}`, {
            variant: "success",
            anchorOrigin: {
               vertical: "bottom",
               horizontal: "right",
            },
            autoHideDuration: 2000,
         })
      }
   )

   return (
      <AgoraRTMClientProvider client={rtmState?.client}>
         <AgoraRTMChannelProvider channel={rtmState?.channel}>
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
