import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import {
   IAgoraRTCClient,
   IAgoraRTCRemoteUser,
   NetworkQuality,
} from "agora-rtc-sdk-ng";
import { RemoteStreamUser, RTCSubscribeErrorCodes } from "types";

interface ClientConfigOptions {
   isUsingCloudProxy?: boolean;
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

   const updateRemoteStreams = (newRemoteStreams) => {
      setRemoteStreams(newRemoteStreams);
   };

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
         let cleanedRemoteStreams = removeStreamFromList(
            remoteUser.uid,
            remoteStreams
         );
         updateRemoteStreams([
            ...cleanedRemoteStreams,
            { uid: remoteUser.uid },
         ]);
      });
      rtcClient.on("user-left", async (remoteUser) => {
         let cleanedRemoteStreams = removeStreamFromList(
            remoteUser.uid,
            remoteStreams
         );
         updateRemoteStreams(cleanedRemoteStreams);
      });

      rtcClient.on("connection-state-change", (curState, prevState) => {
         dispatch(actions.setAgoraRtcConnectionState(curState));
      });

      rtcClient.on("user-published", async (remoteUser, mediaType) => {
         try {
            await rtcClient.subscribe(remoteUser, mediaType);
         } catch (error) {
            handleCatchRtcSubscribeError(error?.code);
            // handleRtcError(error);
         }
         const newRemoteStreams = remoteStreams.map(
            (user: RemoteStreamUser) => {
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
            }
         );
         updateRemoteStreams(newRemoteStreams);
      });

      rtcClient.on("user-unpublished", async (remoteUser, mediaType) => {
         try {
            await rtcClient.unsubscribe(remoteUser, mediaType);
         } catch (error) {
            // handleRtcError(error);
         }
         const newRemoteStreams = remoteStreams.map((user) => {
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
         updateRemoteStreams(newRemoteStreams);
      });

      rtcClient.on("network-quality", (networkStats) => {
         setNetworkQuality(networkStats);
      });
   };

   const handleCatchRtcSubscribeError = (
      errorCode?: RTCSubscribeErrorCodes
   ) => {
      if (errorCode === "NO_ICE_CANDIDATE") {
         if (clientConfigOptions.isUsingCloudProxy) {
            //  - Check whether you have whitelisted the IP addresses and ports that Agora provides for cloud proxy
            //  - ensure that the local client can connect to the TURN server
         } else {
            //  - turn it on
            //  - Check whether the browser has any plugins that disable WebRTC.
            //  - Ensure that you have enabled UDP in the system firewall, and added the [specified domains and ports to the whitelist](https://docs.agora.io/en/Agora%20Platform/firewall?platform=All%20Platforms#web-sdk).
         }
      }
   };

   return { remoteStreams, networkQuality };
}
