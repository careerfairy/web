import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import {
   IAgoraRTCClient,
   IAgoraRTCRemoteUser,
   NetworkQuality,
} from "agora-rtc-sdk-ng";
import {
   CustomRTCErrors,
   RemoteStreamUser,
   RTCError,
   RTCSubscribeErrorCodes,
} from "types";

interface ClientConfigOptions {
   clientIsUsingCloudProxy?: boolean;
}
export default function useAgoraClientConfig(
   rtcClient: IAgoraRTCClient,
   clientConfigOptions?: ClientConfigOptions
) {
   const [remoteStreams, setRemoteStreams] = useState([]);
   const [networkQuality, setNetworkQuality] = useState<NetworkQuality>({
      downlinkNetworkQuality: 0,
      uplinkNetworkQuality: 0,
   });

   const dispatch = useDispatch();

   useEffect(() => {
      if (rtcClient) {
         configureAgoraClient();
      }
   }, [rtcClient]);

   const removeStreamFromList = (
      uid: IAgoraRTCRemoteUser["uid"],
      streamList
   ) => {
      return streamList.filter((entry) => entry.uid !== uid);
   };

   const configureAgoraClient = () => {
      rtcClient.on("user-joined", async (remoteUser) => {
         setRemoteStreams((prevRemoteStreams) => {
            let cleanedRemoteStreams = removeStreamFromList(
               remoteUser.uid,
               prevRemoteStreams
            );
            return [...cleanedRemoteStreams, { uid: remoteUser.uid }];
         });
      });
      rtcClient.on("user-left", async (remoteUser) => {
         setRemoteStreams((prevRemoteStreams) => {
            return removeStreamFromList(remoteUser.uid, prevRemoteStreams);
         });
      });

      rtcClient.on("connection-state-change", (curState, prevState, reason) => {
         dispatch(
            actions.setAgoraRtcConnectionState({ curState, prevState, reason })
         );
      });

      rtcClient.on("user-published", async (remoteUser, mediaType) => {
         try {
            await rtcClient.subscribe(remoteUser, mediaType);
         } catch (error) {
            handleCatchRtcSubscribeError(error?.code);
         }
         setRemoteStreams((prevRemoteStreams) => {
            return prevRemoteStreams.map((user: RemoteStreamUser) => {
               if (user.uid === remoteUser.uid) {
                  if (mediaType === "audio") {
                     user.audioTrack = remoteUser.audioTrack;
                     user.audioMuted = false;
                     remoteUser.audioTrack.play();
                  } else if (mediaType === "video") {
                     user.videoTrack = remoteUser.videoTrack;
                     user.videoMuted = false;
                  }
               }
               return user;
            });
         });
      });

      rtcClient.on("user-unpublished", async (remoteUser, mediaType) => {
         try {
            await rtcClient.unsubscribe(remoteUser, mediaType);
         } catch (error) {
            // handleRtcError(error);
         }
         setRemoteStreams((prevRemoteStreams) => {
            return prevRemoteStreams.map((user) => {
               if (user.uid === remoteUser.uid) {
                  if (mediaType === "audio") {
                     user.audioTrack = null;
                     user.audioMuted = true;
                  } else if (mediaType === "video") {
                     user.videoTrack = null;
                     user.videoMuted = true;
                  }
               }
               return user;
            });
         });
      });

      rtcClient.on("network-quality", (networkStats) => {
         setNetworkQuality(networkStats);
      });
   };

   const handleCatchRtcSubscribeError = (error: RTCError) => {
      console.error("error in handleCatchRtcSubscribeError", error);
      switch (error.code) {
         case RTCSubscribeErrorCodes.NO_ICE_CANDIDATE:
            if (clientConfigOptions.clientIsUsingCloudProxy) {
               dispatch(
                  actions.setAgoraRtcError({
                     ...error,
                     code: CustomRTCErrors.FAILED_TO_SUBSCRIBE_WITH_PROXY,
                  })
               );
            } else {
               dispatch(
                  actions.setAgoraRtcError({
                     ...error,
                     code: CustomRTCErrors.FAILED_TO_SUBSCRIBE_WITHOUT_PROXY,
                  })
               );
            }
            break;
         case RTCSubscribeErrorCodes.INVALID_OPERATION:
            break;
         case RTCSubscribeErrorCodes.INVALID_REMOTE_USER:
            break;
         case RTCSubscribeErrorCodes.OPERATION_ABORTED:
            break;
         case RTCSubscribeErrorCodes.REMOTE_USER_IS_NOT_PUBLISHED:
            break;
         case RTCSubscribeErrorCodes.UNEXPECTED_RESPONSE:
         default:
            console.log("UNKNOWN ERROR", error);
            break;
      }
   };

   return { remoteStreams, networkQuality };
}
