import { useEffect, useState, useRef } from "react";
import window from "global";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import useStreamRef from "./useStreamRef";
import { useFirebase } from "context/firebase";
import useAgoraClientConfig from "./useAgoraClientConfig";

const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";

export default function useAgora(streamerId, isStreamer) {
   const { path } = useStreamRef();
   const dispatch = useDispatch();
   const router = useRouter();
   const { withProxy } = router.query;
   const cfToken = router.query.token || "";

   const [localStream, setLocalStream] = useState(null);

   const { fetchAgoraRtcToken } = useFirebase();

   const [rtcClient, setRtcClient] = useState(null);
   const { remoteStreams } = useAgoraClientConfig(rtcClient, streamerId);

   useEffect(() => {
      if (window) {
         let AgoraRTC = require("agora-rtc-sdk-ng");
         let client = AgoraRTC.createClient({
            mode: "live",
            codec: "h264",
         });
         setRtcClient(client);
      }
   }, [window]);

   useEffect(() => {
      if (rtcClient) {
         joinAgoraRoom();
      }
   }, [rtcClient]);

   useEffect(() => {
      if (isStreamer) {
         initializeLocalStream();
      } else {
         if (localStream) {
            stopLocalStream();
         }
      }
   }, [isStreamer]);

   const joinAgoraRoom = async () => {
      const roomId = streamerId;
      const { data } = await fetchAgoraRtcToken({
         isStreamer: true,
         uid: roomId,
         sentToken: cfToken,
         channelName: roomId,
         streamDocumentPath: path,
      });
      await rtcClient.join(
         AGORA_APP_ID,
         streamerId,
         data.token.rtcToken,
         streamerId
      );
   };

   const initializeLocalStream = async () => {
      let AgoraRTC = require("agora-rtc-sdk-ng");
      const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
      const localVideo = await AgoraRTC.createCameraVideoTrack({
         encoderConfig: "480p_9",
      });
      setLocalStream({
         uid: streamerId,
         isPublished: false,
         isLocal: true,
         audioTrack: localAudio,
         videoTrack: localVideo,
      });
   };

   const stopLocalStream = () => {
      if (localStream) {
         if (localStream.videoTrack) {
            localStream.videoTrack.close();
         }
         if (localStream.audioTrack) {
            localStream.audioTrack.close();
         }
      }
      setLocalStream(null);
   };

   const setLocalAudioEnabled = (value) => {
      localStream.audioTrack.setEnabled(value);
      setLocalStream({
         ...localStream,
         audioMuted: !value,
      });
   };

   const setLocalVideoEnabled = (value) => {
      localStream.videoTrack.setEnabled(value);
      setLocalStream({
         ...localStream,
         videoMuted: !value,
      });
   };

   const publishStream = (client, stream) => {
      if (stream && stream.audioTrack && stream.videoTrack) {
         return new Promise(async (resolve, reject) => {
            try {
               await client.setClientRole("host");
               await client.publish([stream.audioTrack, stream.videoTrack]);
               await client.enableDualStream();
               client.enableAudioVolumeIndicator();
               setLocalStream({
                  ...localStream,
                  isPublished: true,
               });
               resolve();
            } catch (error) {
               reject(error);
            }
         });
      }
   };

   const publishLocalCameraStream = () => {
      return publishStream(rtcClient, localStream);
   };

   return {
      localStream,
      localMediaControls: { setLocalAudioEnabled, setLocalVideoEnabled },
      remoteStreams,
      publishLocalCameraStream,
   };
}
