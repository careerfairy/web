import { useEffect, useState, useRef } from "react";
import window from "global";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import useStreamRef from "./useStreamRef";
import { useFirebase } from "context/firebase";
import useAgoraClientConfig from "./useAgoraClientConfig";
import * as actions from "store/actions";

const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";

export default function useAgoraRtc(streamerId, roomId, isStreamer) {
   const { path } = useStreamRef();
   const router = useRouter();
   const { withProxy } = router.query;
   const cfToken = router.query.token || "";

   const [localStream, setLocalStream] = useState({
      uid: streamerId,
      isAudioPublished: false,
      isVideoPublished: false,
      isLocal: true,
   });
   const [primaryRtcClient, setPrimaryRtcClient] = useState(null);
   const [primaryRtcClientHost, setPrimaryRtcClientHost] = useState(false);

   const { fetchAgoraRtcToken } = useFirebase();
   const dispatch = useDispatch();

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
      if (!isStreamer && primaryRtcClient) {
         if (localStream) {
            closeLocalStream();
         }
      }
   }, [isStreamer, primaryRtcClient]);

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
      try {
         const { data } = await fetchAgoraRtcToken({
            isStreamer: isStreamer,
            uid: userUid,
            sentToken: cfToken,
            channelName: roomId,
            streamDocumentPath: path,
         });
         return rtcClient.join(
            AGORA_APP_ID,
            roomId,
            data.token.rtcToken,
            userUid
         );
      } catch (error) {
         dispatch(actions.setAgoraRtcError(error));
      }
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
         dispatch(actions.setAgoraRtcError(error));
      }
   };

   const initializeLocalAudioStream = async () => {
      return new Promise(async (resolve, reject) => {
         let AgoraRTC = getAgoraRTC();
         try {
            const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalStream((localStream) => ({
               ...localStream,
               audioTrack: localAudio,
            }));
            resolve();
         } catch (error) {
            dispatch(actions.setAgoraRtcError(error));
            reject(error);
         }
      });
   };

   const initializeLocalVideoStream = async () => {
      return new Promise(async (resolve, reject) => {
         let AgoraRTC = getAgoraRTC();
         try {
            const localVideo = await AgoraRTC.createCameraVideoTrack({
               encoderConfig: "480p_9",
            });
            setLocalStream((localStream) => ({
               ...localStream,
               videoTrack: localVideo,
            }));
            resolve();
         } catch (error) {
            dispatch(actions.setAgoraRtcError(error));
            reject(error);
         }
      });
   };

   const closeLocalStream = () => {
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
      setLocalStream((localStream) => ({
         ...localStream,
         audioMuted: !value,
      }));
   };

   const setLocalVideoEnabled = (value) => {
      localStream.videoTrack.setEnabled(value);
      setLocalStream((localStream) => ({
         ...localStream,
         videoMuted: !value,
      }));
   };

   const publishTracks = (client, tracks, streamType) => {
      if (tracks) {
         return new Promise(async (resolve, reject) => {
            try {
               if (streamType === "screen" || !primaryRtcClientHost) {
                  await client.setClientRole("host");
               }
               await client.publish(tracks);
               if (streamType === "video") {
                  await client.enableDualStream();
               }
               if (streamType === "audio") {
                  client.enableAudioVolumeIndicator();
               }
               setPrimaryRtcClientHost(true);
               resolve();
            } catch (error) {
               reject(error);
            }
         });
      }
   };

   const publishLocalCameraTrack = () => {
      return new Promise(async (resolve, reject) => {
         try {
            let localStreamTracks = [localStream.videoTrack];
            await publishTracks(primaryRtcClient, localStreamTracks, "video");
            setLocalStream((localStream) => ({
               ...localStream,
               isVideoPublished: true,
            }));
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const closeLocalCameraTrack = () => {
      return new Promise(async (resolve, reject) => {
         try {
            if (localStream.videoTrack) {
               if (localStream.isVideoPublished) {
                  let localStreamTracks = [localStream.videoTrack];
                  await primaryRtcClient.unpublish(localStreamTracks);
                  await primaryRtcClient.disableDualStream();
               }
               localStream.videoTrack.close();
               setLocalStream((localStream) => ({
                  ...localStream,
                  videoTrack: null,
                  isVideoPublished: false,
               }));
            }
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const publishLocalMicrophoneTrack = () => {
      return new Promise(async (resolve, reject) => {
         try {
            let localStreamTracks = [localStream.audioTrack];
            await publishTracks(primaryRtcClient, localStreamTracks, "audio");
            setLocalStream((localStream) => ({
               ...localStream,
               isAudioPublished: true,
            }));
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const closeLocalMicrophoneTrack = () => {
      return new Promise(async (resolve, reject) => {
         try {
            if (localStream.audioTrack) {
               if (localStream.isAudioPublished) {
                  let localStreamTracks = [localStream.audioTrack];
                  await primaryRtcClient.unpublish(localStreamTracks);
                  if (primaryRtcClientHost) {
                     await primaryRtcClient.setClientRole("audience");
                  }
               }
               setLocalStream((localStream) => ({
                  ...localStream,
                  audioTrack: null,
                  isAudioPublished: false,
               }));
               setPrimaryRtcClientHost(false);
               localStream.audioTrack.close();
            }
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
      return publishTracks(screenShareClient, screenShareTracks, "screen");
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
      localMediaEnabling: {
         initializeLocalAudioStream,
         initializeLocalVideoStream,
         closeLocalCameraTrack,
         closeLocalMicrophoneTrack,
      },
      localMediaControls: { setLocalAudioEnabled, setLocalVideoEnabled },
      remoteStreams,
      publishLocalStreamTracks: {
         publishLocalCameraTrack,
         publishLocalMicrophoneTrack,
      },
      publishScreenShareStream,
      unpublishScreenShareStream,
      leaveAgoraRoom,
   };
}
