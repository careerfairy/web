import { useEffect, useState, useRef } from "react";
import window from "global";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import useStreamRef from "./useStreamRef";
import { useFirebase } from "context/firebase";
import useAgoraClientConfig from "./useAgoraClientConfig";

const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";

export default function useAgoraRtc(streamerId, roomId, isStreamer) {
   const { path } = useStreamRef();
   const router = useRouter();
   const { withProxy } = router.query;
   const cfToken = router.query.token || "";

   const [localStream, setLocalStream] = useState(null);
   const [primaryRtcClient, setPrimaryRtcClient] = useState(null);

   const { fetchAgoraRtcToken } = useFirebase();

   const [screenShareStream, setScreenShareStream] = useState(null);
   const screenShareStreamRef = useRef(screenShareStream);
   const [screenShareRtcClient, setScreenShareRtcClient] = useState(null);
   const screenShareRtcClientRef = useRef(screenShareRtcClient);

   const { remoteStreams, networkQuality } = useAgoraClientConfig(
      primaryRtcClient,
      streamerId
   );

   useEffect(() => {
      if (window) {
         let client = createAgoraClient();
         setPrimaryRtcClient(client);
      }
   }, [window]);

   useEffect(() => {
      if (primaryRtcClient) {
         joinAgoraRoomWithPrimaryClient();
      }
   }, [primaryRtcClient]);

   useEffect(() => {
      if (isStreamer) {
         initializeLocalStream();
      } else {
         if (localStream) {
            stopLocalStream();
         }
      }
   }, [isStreamer]);

   const updateScreenShareRtcClient = (newScreenShareRtcClient) => {
      screenShareRtcClientRef.current = newScreenShareRtcClient;
      setScreenShareRtcClient(newScreenShareRtcClient);
   };

   const updateScreenShareStream = (newScreenShareStream) => {
      screenShareStreamRef.current = newScreenShareStream;
      setScreenShareStream(newScreenShareStream);
   };

   const getAgoraRTC = () => {
      return require("agora-rtc-sdk-ng");
   };

   const createAgoraClient = () => {
      let AgoraRTC = getAgoraRTC();
      return AgoraRTC.createClient({
         mode: "live",
         codec: "vp8",
      });
   };

   const joinAgoraRoom = async (rtcClient, roomId, userUid, isStreamer) => {
      const { data } = await fetchAgoraRtcToken({
         isStreamer: isStreamer,
         uid: userUid,
         sentToken: cfToken,
         channelName: roomId,
         streamDocumentPath: path,
      });
      return rtcClient.join(AGORA_APP_ID, roomId, data.token.rtcToken, userUid);
   };

   const leaveAgoraRoom = async () => {
      try {
         if (rtcClient) {
            await rtcClient.leave();
         }
      } catch (error) {
         console.log(error);
      }
   };

   const joinAgoraRoomWithPrimaryClient = async () => {
      try {
         await joinAgoraRoom(primaryRtcClient, roomId, streamerId, isStreamer);
      } catch (error) {
         // handle join error
      }
   };

   const initializeLocalStream = async () => {
      let AgoraRTC = getAgoraRTC();
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

   const publishTracks = (client, tracks, isCameraStream) => {
      if (tracks) {
         return new Promise(async (resolve, reject) => {
            try {
               await client.setClientRole("host");
               await client.publish(tracks);
               if (isCameraStream) {
                  await client.enableDualStream();
                  client.enableAudioVolumeIndicator();
               }
               resolve();
            } catch (error) {
               reject(error);
            }
         });
      }
   };

   const publishLocalCameraStream = () => {
      return new Promise(async (resolve, reject) => {
         try {
            let localStreamTracks = [
               localStream.audioTrack,
               localStream.videoTrack,
            ];
            await publishTracks(primaryRtcClient, localStreamTracks, true);
            setLocalStream({
               ...localStream,
               isPublished: true,
            });
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const publishScreenShareStream = async (
      screenSharingMode,
      onScreenShareStopped
   ) => {
      return new Promise(async (resolve, reject) => {
         let screenShareClient = createAgoraClient();
         try {
            const screenShareUid = `${streamerId}screen`;
            await joinAgoraRoom(
               screenShareClient,
               roomId,
               screenShareUid,
               true
            );
            publishScreenShareTracks(
               screenShareClient,
               screenSharingMode,
               onScreenShareStopped
            );
            updateScreenShareRtcClient(screenShareClient);
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const unpublishScreenShareStream = async () => {
      return new Promise(async (resolve, reject) => {
         try {
            let screenShareRtcClient = screenShareRtcClientRef.current;
            let screenShareStream = screenShareStreamRef.current;
            await screenShareRtcClient.unpublish(screenShareStream);
            if (Array.isArray(screenShareStream)) {
               screenShareStream.forEach((track) => track.close());
            } else {
               screenShareStream.close();
            }
            await screenShareRtcClient.leave();
            updateScreenShareStream(null);
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const publishScreenShareTracks = async (
      screenShareClient,
      screenSharingMode,
      onScreenShareStopped
   ) => {
      let screenShareTracks = await getScreenShareStream(
         screenSharingMode,
         onScreenShareStopped
      );
      updateScreenShareStream(screenShareTracks);
      return publishTracks(screenShareClient, screenShareTracks, false);
   };

   const getScreenShareStream = async (
      screenSharingMode,
      onScreenShareStopped
   ) => {
      return new Promise(async (resolve, reject) => {
         let screenShareVideoResolution =
            screenSharingMode === "motion" ? "720p_2" : "1080p_1";
         try {
            const tracksObject = await getAgoraRTC().createScreenVideoTrack(
               {
                  encoderConfig: screenShareVideoResolution,
               },
               "auto"
            );
            const videoTrack = Array.isArray(tracksObject)
               ? tracksObject[0]
               : tracksObject;
            videoTrack.on("track-ended", onScreenShareStopped);
            resolve(tracksObject);
         } catch (error) {
            if (error.code === "PERMISSION_DENIED") {
               //handle case that user has cancel screen share within browser
            } else if (error.code === "SHARE_AUDIO_NOT_ALLOWED") {
               // handle share audio not allowed
            } else {
               reject(error);
            }
         }
      });
   };

   return {
      networkQuality,
      localStream,
      localMediaControls: { setLocalAudioEnabled, setLocalVideoEnabled },
      remoteStreams,
      publishLocalCameraStream,
      publishScreenShareStream,
      unpublishScreenShareStream,
      leaveAgoraRoom,
   };
}
