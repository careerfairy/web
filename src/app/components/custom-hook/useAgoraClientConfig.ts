import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import {
   IAgoraRTCClient,
   IAgoraRTCRemoteUser,
   NetworkQuality,
} from "agora-rtc-sdk-ng";
import { RemoteStreamUser } from "types/streaming";

export default function useAgoraClientConfig(rtcClient: IAgoraRTCClient) {
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
      rtcClient.on("is-using-cloud-proxy", (isUsing) => {
         dispatch(actions.setSessionIsUsingCloudProxy(Boolean(isUsing)));
      });
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
         } catch (error) {}
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

   const demoStreamHandlers = useMemo(
      () => ({
         addDemoStream: () =>
            setRemoteStreams((prevRemoteStreams) => [
               ...prevRemoteStreams,
               {
                  streamId: "demoStream",
                  uid: "demoStream",
                  url: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media",
               },
            ]),
         removeDemoStream: () =>
            setRemoteStreams((prevRemoteStreams) =>
               prevRemoteStreams.filter((stream) => stream.uid !== "demoStream")
            ),
      }),
      []
   );

   return { remoteStreams, networkQuality, demoStreamHandlers };
}
