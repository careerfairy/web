import {
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import AgoraRTM, { RtmMessage } from "agora-rtm-sdk"
import { useFirebaseService } from "../firebase/FirebaseServiceContext"

import { useDispatch } from "react-redux"
import RTMContext, {
   AgoraRTMContextInterface,
   EmoteMessage,
   EmoteType,
} from "./RTMContext"
import * as actions from "store/actions"
import { agoraCredentials } from "../../data/agora/AgoraInstance"
import { errorLogAndNotify } from "../../util/CommonUtil"
import { getBaseUrl } from "../../components/helperFunctions/HelperFunctions"
import { RTMStatus } from "../../types/streaming"
import { setSessionRTMFailedToJoin } from "store/actions/streamActions"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"

interface Props {
   children: JSX.Element
   livestreamId: string
   roomId?: string
   userId?: string
}

const RTMProvider = ({ livestreamId, children, roomId, userId }: Props) => {
   const rtmClient = useRef<AgoraRTMContextInterface["rtmClient"]>(null!)
   const rtmChannel = useRef<AgoraRTMContextInterface["rtmChannel"]>(null!)

   const [rtmStatus, setRtmStatus] = useState<RTMStatus>(null)

   const { fetchAgoraRtmToken } = useFirebaseService()
   const dispatch = useDispatch()

   const init = useCallback(() => {
      try {
         rtmClient.current = AgoraRTM.createInstance(agoraCredentials.appID, {
            logFilter: AgoraRTM.LOG_FILTER_INFO,
         })

         /**
          * Occurs when the connection state changes between the SDK and the Agora RTM system.
          */
         rtmClient.current.on(
            "ConnectionStateChanged",
            (connectionState, reason) => {
               logRTMEvent("ConnectionStateChanged", connectionState, reason)
               setRtmStatus({ connectionState, reason })
            }
         )

         /**
          * Occurs when the local user receives a peer-to-peer message from a remote user.
          */
         rtmClient.current.on(
            "MessageFromPeer",
            (message, uidSender, msgProperties) => {
               logRTMEvent("MessageFromPeer", message, uidSender, msgProperties)
            }
         )

         /**
          * Fix RtmInternalError: Cannot get illegal vid. error
          * Sometimes users leave the streaming page open for long periods, the RTM token is only
          * valid for 24h (https://docs.agora.io/en/signaling/develop/authentication-workflow)
          *
          * Redirect the user to the event page again
          *   This shouldn't happen when the livestream is still live but if it is, the user
          *   will be redirected back to the streaming app automatically
          */
         rtmClient.current.on("TokenExpired", () => {
            errorLogAndNotify(new Error("RTM TokenExpired")) // save this event on sentry
            if (typeof window !== "undefined") {
               window.location.href =
                  makeLivestreamEventDetailsUrl(livestreamId)
            }
         })
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to create RTM instance",
         })
         throw error
      }
   }, [livestreamId])

   const onChannelMessage = useCallback(
      (message: RtmMessage, memberId: string) => {
         if (message.messageType === "TEXT") {
            const messageData: EmoteMessage = JSON.parse(message.text)
            if (messageData.textType === "EMOTE") {
               dispatch(actions.setEmote(messageData, memberId))
            }
         }
      },
      [dispatch]
   )

   const onMemberCountUpdated = useCallback(
      (newCount: number) => {
         dispatch(actions.setNumberOfViewers(newCount))
      },
      [dispatch]
   )

   const joinAgoraRtmChannel = useCallback(
      async (roomId: string, userUid: string) => {
         const { data } = await fetchAgoraRtmToken({
            uid: userUid,
         })

         try {
            await rtmClient.current.login({
               token: data.token.rtmToken,
               uid: userUid,
            })

            const channel = rtmClient.current.createChannel(roomId)
            channel.on("ChannelMessage", onChannelMessage)

            await channel.join()
            channel.on("MemberCountUpdated", onMemberCountUpdated)
            rtmChannel.current = channel
            dispatch(setSessionRTMFailedToJoin(false))
         } catch (error) {
            dispatch(setSessionRTMFailedToJoin(true))
            errorLogAndNotify(error, {
               message: "Failed to join Agora RTM channel",
            })
         }
      },
      [dispatch, fetchAgoraRtmToken, onChannelMessage, onMemberCountUpdated]
   )

   useEffect(() => {
      if (roomId && userId) {
         void joinAgoraRtmChannel(roomId, userId).catch(errorLogAndNotify)
      }
   }, [roomId, userId, joinAgoraRtmChannel])

   const createEmote = useCallback(
      async (emoteType: EmoteType) => {
         try {
            const messageToSend = dispatch(actions.createEmote(emoteType))
            await rtmChannel.current.sendMessage(messageToSend as any)
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Failed to send emote",
            })
         }
      },
      [dispatch]
   )

   const agoraHandlers = useMemo(
      () => ({
         getChannelMemberCount: async (channelIds: string[]) => {
            try {
               return await rtmClient.current.getChannelMemberCount(channelIds)
            } catch (e) {
               errorLogAndNotify(e, {
                  message: "Failed to get channel member count",
               })
               throw e
            }
         },
         handleDisconnect: async () => {
            try {
               // Order taken from the Agora UI KIt Logout method, works properly without errors now
               await rtmClient.current.logout()
               rtmClient.current.removeAllListeners()
            } catch (e) {
               errorLogAndNotify(e, {
                  message: "Failed to logout of Agora RTM",
               })
            }
         },
         joinChannel: async (
            targetRoomId: string,
            handleMemberJoined: (joinerId: string) => any,
            handleMemberLeft: (leaverId: string) => any,
            updateMemberCount: (roomId: string, newMemberCount: number) => void
         ) => {
            try {
               let newChannel: AgoraRTMContextInterface["rtmChannel"]
               if (targetRoomId === roomId) {
                  // Dont re-join the current stream channel pls
                  newChannel = rtmChannel.current
               } else {
                  newChannel = rtmClient.current.createChannel(targetRoomId)
                  await newChannel.join()
               }
               newChannel.on("MemberJoined", handleMemberJoined)
               newChannel.on("MemberLeft", handleMemberLeft)
               newChannel.on("MemberCountUpdated", (newCount) => {
                  updateMemberCount(roomId, newCount - 1)
               })
               return newChannel
            } catch (e) {
               errorLogAndNotify(e, {
                  message: "Failed to join Agora RTM channel",
               })
               throw e
            }
         },
         getChannelMembers: async (
            channel: AgoraRTMContextInterface["rtmChannel"]
         ) => {
            try {
               return await channel.getMembers()
            } catch (e) {
               errorLogAndNotify(e, {
                  message: "Failed to get channel members",
               })
               throw e
            }
         },
         leaveChannel: async (
            channel: AgoraRTMContextInterface["rtmChannel"]
         ) => {
            try {
               if (channel.channelId === roomId) return // Dont leave the current stream channel pls
               channel.removeAllListeners()
               await channel.leave()
            } catch (e) {
               errorLogAndNotify(e, {
                  message: "Failed to leave Agora RTM channel",
               })
               throw e
            }
         },
      }),
      [rtmClient, roomId]
   )

   const end = useCallback(() => {
      return agoraHandlers.handleDisconnect()
   }, [agoraHandlers])

   useEffect(() => {
      init()
      return () => {
         void end()
      }
   }, [init, end])

   const contextValue = useMemo(
      () => ({
         createEmote,
         agoraHandlers,
         rtmChannel: rtmChannel.current,
         rtmClient: rtmClient.current,
         rtmStatus,
      }),
      [agoraHandlers, createEmote, rtmStatus]
   )

   return (
      <RTMContext.Provider value={contextValue}>{children}</RTMContext.Provider>
   )
}

export const useRTM = () => {
   const context = useContext(RTMContext)
   if (!context) {
      throw new Error("useRTM must be used within a RTMProvider")
   }
   return context
}

function logRTMEvent(event: string, ...args: any[]) {
   console.log(`RTM Event: ${event}`, ...args)
}

export default RTMProvider
