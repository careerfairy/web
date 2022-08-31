import { useCallback, useEffect, useMemo, useRef } from "react"
import AgoraRTM, { RtmMessage } from "agora-rtm-sdk"
import { useFirebaseService } from "../firebase/FirebaseServiceContext"

import { useDispatch } from "react-redux"
import AgoraRTMContext, {
   AgoraRTMContextInterface,
   EmoteMessage,
   EmoteType,
} from "./AgoraRTMContext"
import * as actions from "store/actions"
import { agoraCredentials } from "../../data/AgoraInstance"

interface Props {
   children: JSX.Element
   roomId?: string
   userId?: string
}

const AgoraRTMProvider = ({ children, roomId, userId }: Props) => {
   const rtmClient = useRef<AgoraRTMContextInterface["rtmClient"]>(null!)
   const rtmChannel = useRef<AgoraRTMContextInterface["rtmChannel"]>(null!)

   const { fetchAgoraRtmToken } = useFirebaseService()
   const dispatch = useDispatch()

   const init = useCallback(() => {
      rtmClient.current = AgoraRTM.createInstance(agoraCredentials.appID, {
         logFilter: AgoraRTM.LOG_FILTER_ERROR,
      })
   }, [])

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
            console.error(error)
         }
      },
      [fetchAgoraRtmToken, onChannelMessage, onMemberCountUpdated]
   )

   useEffect(() => {
      if (roomId && userId) {
         void joinAgoraRtmChannel(roomId, userId)
      }
   }, [roomId, userId, joinAgoraRtmChannel])

   const createEmote = useCallback(
      async (emoteType: EmoteType) => {
         try {
            const messageToSend = dispatch(actions.createEmote(emoteType))
            await rtmChannel.current.sendMessage(messageToSend as any)
         } catch (e) {
            console.error(e)
         }
      },
      [dispatch]
   )

   const agoraHandlers = useMemo(
      () => ({
         getChannelMemberCount: async (channelIds: string[]) => {
            return await rtmClient.current.getChannelMemberCount(channelIds)
         },
         handleDisconnect: async () => {
            try {
               await rtmChannel.current.leave()
               if (rtmChannel.current) {
                  rtmChannel.current.removeAllListeners()
               }
               if (rtmClient.current) {
                  rtmClient.current.removeAllListeners()
                  await rtmClient.current
                     .logout()
                     .catch((error) => console.error(error))
               }
            } catch (e) {
               console.error(e)
            }
         },
         joinChannel: async (
            targetRoomId: string,
            handleMemberJoined: (joinerId: string) => any,
            handleMemberLeft: (leaverId: string) => any,
            updateMemberCount: (roomId: string, newMemberCount: number) => void
         ) => {
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
         },
         getChannelMembers: async (
            channel: AgoraRTMContextInterface["rtmChannel"]
         ) => {
            return await channel.getMembers()
         },
         leaveChannel: async (
            channel: AgoraRTMContextInterface["rtmChannel"]
         ) => {
            if (channel.channelId === roomId) return // Dont leave the current stream channel pls
            channel.removeAllListeners()
            await channel.leave()
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
      <AgoraRTMContext.Provider value={contextValue}>
         {children}
      </AgoraRTMContext.Provider>
   )
}

export default AgoraRTMProvider
