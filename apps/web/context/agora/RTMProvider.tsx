import { useCallback, useEffect, useMemo, useRef } from "react"
import AgoraRTM, { RtmMessage } from "agora-rtm-sdk"
import { useFirebaseService } from "../firebase/FirebaseServiceContext"

import { useDispatch, useSelector } from "react-redux"
import RTMContext, {
   AgoraRTMContextInterface,
   EmoteMessage,
   EmoteType,
} from "./RTMContext"
import * as actions from "store/actions"
import { agoraCredentials } from "../../data/agora/AgoraInstance"
import { useSessionStorage } from "react-use"
import { sessionIsUsingCloudProxySelector } from "../../store/selectors/streamSelectors"
import { errorLogAndNotify } from "../../util/CommonUtil"

interface Props {
   children: JSX.Element
   roomId?: string
   userId?: string
}

const RTMProvider = ({ children, roomId, userId }: Props) => {
   const rtmClient = useRef<AgoraRTMContextInterface["rtmClient"]>(null!)
   const rtmChannel = useRef<AgoraRTMContextInterface["rtmChannel"]>(null!)
   const sessionIsUsingCloudProxy = useSelector(
      sessionIsUsingCloudProxySelector
   )
   const [sessionShouldUseCloudProxy] = useSessionStorage<boolean>(
      "is-using-cloud-proxy",
      false
   )

   const useProxy = sessionIsUsingCloudProxy || sessionShouldUseCloudProxy

   const { fetchAgoraRtmToken } = useFirebaseService()
   const dispatch = useDispatch()

   const init = useCallback(() => {
      try {
         rtmClient.current = AgoraRTM.createInstance(agoraCredentials.appID, {
            logFilter: AgoraRTM.LOG_FILTER_INFO,
            enableCloudProxy: useProxy,
         })
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to create RTM instance",
         })
         throw error
      }
   }, [useProxy])

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
         } catch (error) {
            errorLogAndNotify(error, {
               message: "Failed to join Agora RTM channel",
            })
         }
      },
      [fetchAgoraRtmToken, onChannelMessage, onMemberCountUpdated]
   )

   useEffect(() => {
      if (roomId && userId) {
         void joinAgoraRtmChannel(roomId, userId).catch(errorLogAndNotify)
      }
   }, [roomId, userId, joinAgoraRtmChannel, useProxy])

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
               await rtmClient.current.removeAllListeners()
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
      }),
      [agoraHandlers, createEmote]
   )

   return (
      <RTMContext.Provider value={contextValue}>{children}</RTMContext.Provider>
   )
}

export default RTMProvider
