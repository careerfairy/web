import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AgoraRTM, { RtmMessage, RtmStatusCode } from "agora-rtm-sdk";
import { useFirebaseService } from "../firebase/FirebaseServiceContext";

import { useDispatch } from "react-redux";
import AgoraRTMContext, {
   AgoraRTMContextInterface,
   EmoteMessage,
   EmoteType,
} from "./AgoraRTMContext";
import * as actions from "store/actions";

const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";

interface Props {
   children: JSX.Element;
   roomId?: string;
   userId?: string;
}

const AgoraRTMProvider = ({ children, roomId, userId }: Props) => {
   const rtmClient = useRef<AgoraRTMContextInterface["rtmClient"]>(null!);
   const rtmChannel = useRef<AgoraRTMContextInterface["rtmChannel"]>(null!);

   const [agoraRtmStatus, setAgoraRtmStatus] = useState({
      type: "INFO",
      msg: "RTM_INITIAL",
   });

   const { fetchAgoraRtmToken } = useFirebaseService();
   const dispatch = useDispatch();

   useEffect(() => {
      init();
      return () => {
         void end();
      };
   }, []);

   const init = () => {
      const newRtmClient = AgoraRTM.createInstance(AGORA_APP_ID, {
         logFilter: AgoraRTM.LOG_FILTER_ERROR,
      });
      newRtmClient.on("ConnectionStateChanged", onConnectionStateChanged);

      rtmClient.current = newRtmClient;
   };

   const end = () => {
      return agoraHandlers.handleDisconnect();
   };

   useEffect(() => {
      if (roomId && userId) {
         void joinAgoraRtmChannel(roomId, userId);
      }
   }, [roomId, userId]);

   const onConnectionStateChanged = (
      newState: RtmStatusCode.ConnectionState,
      reason: RtmStatusCode.ConnectionChangeReason
   ) => {
      if (newState === "DISCONNECTED") {
         setAgoraRtmStatus({
            type: "INFO",
            msg: "RTM_DISCONNECTED",
         });
      } else if (newState === "RECONNECTING" && reason === "INTERRUPTED") {
         setAgoraRtmStatus({
            type: "ERROR",
            msg: "RTM_NETWORK_INTERRUPTED",
         });
      } else if (newState === "CONNECTED") {
         setAgoraRtmStatus({
            type: "INFO",
            msg: "RTM_CONNECTED",
         });
      }
   };

   const joinAgoraRtmChannel = async (roomId: string, userUid: string) => {
      const { data } = await fetchAgoraRtmToken({
         uid: userUid,
      });

      try {
         await rtmClient.current.login({
            token: data.token.rtmToken,
            uid: userUid,
         });

         const channel = rtmClient.current.createChannel(roomId);
         channel.on("ChannelMessage", onChannelMessage);

         await channel.join();
         channel.on("MemberCountUpdated", onMemberCountUpdated);
         rtmChannel.current = channel;
      } catch (error) {}
   };

   const onChannelMessage = (message: RtmMessage, memberId: string) => {
      if (message.messageType === "TEXT") {
         const messageData: EmoteMessage = JSON.parse(message.text);
         if (messageData.textType === "EMOTE") {
            dispatch(actions.setEmote(messageData, memberId));
         }
      }
   };

   const onMemberCountUpdated = (newCount: number) => {
      dispatch(actions.setNumberOfViewers(newCount));
   };

   const createEmote = useCallback(
      async (emoteType: EmoteType) => {
         try {
            const messageToSend = dispatch(actions.createEmote(emoteType));
            await rtmChannel.current.sendMessage(messageToSend as any);
         } catch (e) {}
      },
      [dispatch, rtmChannel.current]
   );

   const agoraHandlers = useMemo(
      () => ({
         getChannelMemberCount: async (channelIds: string[]) => {
            return await rtmClient.current.getChannelMemberCount(channelIds);
         },
         handleDisconnect: async () => {
            if (rtmChannel.current) {
               rtmChannel.current.removeAllListeners();
               await rtmChannel.current.leave();
            }
            if (rtmClient.current) {
               rtmClient.current.removeAllListeners();
               await rtmClient.current
                  .logout()
                  .catch((error) => console.error(error));
            }
         },
         joinChannel: async (
            targetRoomId: string,
            handleMemberJoined: (joinerId: string) => any,
            handleMemberLeft: (leaverId: string) => any,
            updateMemberCount: (roomId: string, newMemberCount: number) => void
         ) => {
            let newChannel: AgoraRTMContextInterface["rtmChannel"];
            if (targetRoomId === roomId) {
               // Dont re-join the current stream channel pls
               newChannel = rtmChannel.current;
            } else {
               newChannel = rtmClient.current.createChannel(targetRoomId);
               await newChannel.join();
            }
            newChannel.on("MemberJoined", handleMemberJoined);
            newChannel.on("MemberLeft", handleMemberLeft);
            newChannel.on("MemberCountUpdated", (newCount) => {
               updateMemberCount(roomId, newCount - 1);
            });
            return newChannel;
         },
         getChannelMembers: async (
            channel: AgoraRTMContextInterface["rtmChannel"]
         ) => {
            return await channel.getMembers();
         },
         leaveChannel: async (
            channel: AgoraRTMContextInterface["rtmChannel"]
         ) => {
            if (channel.channelId === roomId) return; // Dont leave the current stream channel pls
            channel.removeAllListeners();
            await channel.leave();
         },
      }),
      [rtmClient, rtmChannel.current, roomId]
   );
   return (
      <AgoraRTMContext.Provider
         value={{
            createEmote,
            agoraHandlers,
            rtmChannel: rtmChannel.current,
            rtmClient: rtmClient.current,
         }}
      >
         {children}
      </AgoraRTMContext.Provider>
   );
};

export default AgoraRTMProvider;
