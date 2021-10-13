import { EMOTE_MESSAGE_TEXT_TYPE } from "components/util/constants";
import { useFirebase } from "context/firebase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "../../store/actions";

const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";

export default function useAgoraRtm(roomId, userId) {
   const [rtmClient, setRtmClient] = useState(null);
   const [rtmChannel, setRtmChannel] = useState(null);
   const [joinedChannel, setJoinedChannel] = useState(false);

   const [agoraRtmStatus, setAgoraRtmStatus] = useState({
      type: "INFO",
      msg: "RTM_INITIAL",
   });

   const { fetchAgoraRtmToken } = useFirebase();
   const dispatch = useDispatch();

   useEffect(() => {
      if (window) {
         let client = createAgoraRtmClient();
         setRtmClient(client);
      }
   }, [window]);

   useEffect(() => {
      if (rtmClient) {
         joinAgoraRtmChannel(rtmClient, roomId, userId);
      }
   }, [rtmClient]);

   const getAgoraRTM = () => {
      return require("agora-rtm-sdk");
   };

   const createAgoraRtmClient = () => {
      let AgoraRTM = getAgoraRTM();
      let rtmClient = AgoraRTM.createInstance(AGORA_APP_ID, {
         logFilter: AgoraRTM.LOG_FILTER_ERROR,
      });
      rtmClient.on("ConnectionStateChanged", onConnectionStateChanged);
      return rtmClient;
   };

   const onConnectionStateChanged = (newState, reason) => {
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

   const joinAgoraRtmChannel = async (rtmClient, roomId, userUid) => {
      const { data } = await fetchAgoraRtmToken({
         uid: userUid,
      });

      try {
         await rtmClient.login({
            token: data.token.rtmToken,
            uid: userUid,
         });

         const channel = rtmClient.createChannel(roomId);
         channel.on("ChannelMessage", onChannelMessage);

         await channel.join();
         setJoinedChannel(true);
         channel.on("MemberCountUpdated", onMemberCountUpdated);

         setRtmChannel(channel);
      } catch (error) {}
   };

   const onChannelMessage = (message, memberId) => {
      if (message.messageType === "TEXT") {
         const messageData = JSON.parse(message.text);
         if (messageData.textType === EMOTE_MESSAGE_TEXT_TYPE) {
            dispatch(actions.setEmote(messageData, memberId));
         }
      }
   };

   const onMemberCountUpdated = (newCount) => {
      dispatch(actions.setNumberOfViewers(newCount));
   };

   const createEmote = useCallback(
      async (emoteType) => {
         try {
            const messageToSend = await dispatch(
               actions.createEmote(emoteType)
            );
            rtmChannel.sendMessage(messageToSend);
         } catch (e) {}
      },
      [dispatch, rtmChannel]
   );

   const agoraHandlers = useMemo(
      () => ({
         getChannelMemberCount: async (channelIds) => {
            return await rtmClient.getChannelMemberCount(channelIds);
         },
         handleDisconnect: async () => {
            if (rtmChannel) {
               rtmChannel.removeAllListeners();
               await rtmChannel.leave();
            }
            if (rtmClient) {
               rtmClient.removeAllListeners();
               await rtmClient.logout();
            }
         },
         joinChannel: async (
            targetRoomId,
            handleMemberJoined,
            handleMemberLeft,
            updateMemberCount
         ) => {
            let newChannel;
            if (targetRoomId === roomId) {
               // Dont re-join the current stream channel pls
               newChannel = rtmChannel;
            } else {
               newChannel = rtmClient.createChannel(targetRoomId);
               await newChannel.join();
            }
            newChannel.on("MemberJoined", handleMemberJoined);
            newChannel.on("MemberLeft", handleMemberLeft);
            newChannel.on("MemberCountUpdated", (newCount) => {
               updateMemberCount(roomId, newCount - 1);
            });
            return newChannel;
         },
         getChannelMembers: async (channel) => {
            return await channel.getMembers();
         },
         leaveChannel: async (channel) => {
            if (channel.channelId === roomId) return; // Dont leave the current stream channel pls
            channel.removeAllListeners();
            await channel.leave();
         },
      }),
      [rtmClient, rtmChannel, roomId]
   );
   return { createEmote, agoraHandlers };
}
