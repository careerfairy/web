import { useEffect, useState, useRef } from "react";

export default function useAgoraClientConfig(rtcClient, streamerId) {
   const [remoteStreams, setRemoteStreams] = useState([]);
   const [networkQuality, setNetworkQuality] = useState({
      downlinkNetworkQuality: 0,
      type: "network-quality",
      uplinkNetworkQuality: 0,
   });

   const remoteStreamsRef = useRef(remoteStreams);

   const updateRemoteStreams = (newRemoteStreams) => {
      remoteStreamsRef.current = newRemoteStreams;
      setRemoteStreams(newRemoteStreams);
   };

   useEffect(() => {
      if (rtcClient) {
         configureAgoraClient();
      }
   }, [rtcClient]);

   const removeStreamFromList = (uid, streamList) => {
      const streamListCopy = [...streamList];
      const streamEntry = streamListCopy.find((entry) => {
         return entry.uid === uid;
      });
      if (streamEntry) {
         streamListCopy.splice(streamListCopy.indexOf(streamEntry), 1);
      }
      return streamListCopy;
   };

   const configureAgoraClient = () => {
      let AgoraRTC = require("agora-rtc-sdk-ng");
      AgoraRTC.onAudioAutoplayFailed = () => {};
      rtcClient.on("user-joined", async (remoteUser) => {
         let cleanedRemoteStreams = removeStreamFromList(
            remoteUser.uid,
            remoteStreamsRef.current
         );
         updateRemoteStreams([
            ...cleanedRemoteStreams,
            { uid: remoteUser.uid },
         ]);
      });
      rtcClient.on("user-left", async (remoteUser) => {
         let cleanedRemoteStreams = removeStreamFromList(
            remoteUser.uid,
            remoteStreamsRef.current
         );
         updateRemoteStreams([...cleanedRemoteStreams]);
      });

      rtcClient.on("connection-state-change", (curState, prevState) => {
         //  setAgoraRtcConnectionStatus({
         //     curState,
         //     prevState,
         //  });
      });

      rtcClient.on("user-published", async (remoteUser, mediaType) => {
         try {
            await rtcClient.subscribe(remoteUser, mediaType);
         } catch (error) {
            // handleRtcError(error);
         }
         let remoteStreams = [...remoteStreamsRef.current];
         remoteStreams.forEach((user) => {
            if (user.uid === remoteUser.uid) {
               if (mediaType === "audio") {
                  user.audioTrack = remoteUser.audioTrack;
                  remoteUser.audioTrack.play();
               } else if (mediaType === "video") {
                  user.videoTrack = remoteUser.videoTrack;
               }
            }
         });
         updateRemoteStreams(remoteStreams);
      });

      rtcClient.on("user-unpublished", async (remoteUser, mediaType) => {
         try {
            await rtcClient.unsubscribe(remoteUser, mediaType);
         } catch (error) {
            // handleRtcError(error);
         }
         let remoteStreams = [...remoteStreamsRef.current];
         remoteStreams.forEach((user) => {
            if (user.uid === remoteUser.uid) {
               if (mediaType === "audio") {
                  user.audioTrack = null;
               } else if (mediaType === "video") {
                  user.videoTrack = null;
               }
            }
         });
         updateRemoteStreams(remoteStreams);
      });

      rtcClient.on("network-quality", (networkStats) => {
         setNetworkQuality(networkStats);
      });
   };

   return { remoteStreams, networkQuality };
}
