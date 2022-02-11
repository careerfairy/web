import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import useStreamRef from "./useStreamRef";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import useAgoraClientConfig from "./useAgoraClientConfig";
import AgoraRTC, {
   IAgoraRTCClient,
   ScreenVideoTrackInitConfig,
} from "agora-rtc-sdk-ng";
import * as actions from "store/actions";
import { useSessionStorage } from "react-use";
import { RTC_CLIENT_JOIN_TIME_LIMIT } from "constants/streams";

const rtcClient = AgoraRTC.createClient({
   mode: "live",
   codec: "vp8",
});

const screenShareRtcClient = AgoraRTC.createClient({
   mode: "live",
   codec: "vp8",
});

const AGORA_APP_ID = "53675bc6d3884026a72ecb1de3d19eb1";
export default function useAgoraRtc(
   streamerId: string,
   roomId: string,
   isStreamer: boolean
) {
   const { path } = useStreamRef();
   const {
      query: { token },
   } = useRouter();
   const [sessionIsUsingCloudProxy, setSessionIsUsingProxy] = useSessionStorage<
      boolean
   >("is-using-cloud-proxy", false);

   const [clientIsUsingCloudProxy, setClientIsUsingCloudProxy] = useState(
      false
   );

   const [localStream, setLocalStream] = useState({
      uid: streamerId,
      isAudioPublished: false,
      isVideoPublished: false,
      isLocal: true,
      videoTrack: null,
      audioTrack: null,
   });
   const [rtcClientHost, setPrimaryRtcClientHost] = useState(false);

   const { fetchAgoraRtcToken } = useFirebaseService();
   const dispatch = useDispatch();

   const [screenShareStream, setScreenShareStream] = useState(null);
   const screenShareStreamRef = useRef(screenShareStream);
   const screenShareRtcClientRef = useRef(screenShareRtcClient);

   const { remoteStreams, networkQuality } = useAgoraClientConfig(rtcClient, {
      clientIsUsingCloudProxy,
   });

   useEffect(() => {
      rtcClient.on("is-using-cloud-proxy", (isUsing) => {
         console.log("-> isUsing proxy in emit", isUsing);
         setClientIsUsingCloudProxy(isUsing);
      });
   }, []);

   useEffect(() => {
      let isAudioAutoplayFailed = false;
      AgoraRTC.onAudioAutoplayFailed = () => {
         console.log("-> In OnAudioAutoplayFailed");
         if (isAudioAutoplayFailed) return;
         isAudioAutoplayFailed = true;
         const btn = document.createElement("button");
         btn.innerText = "Click me to resume the audio playback";
         btn.onclick = () => {
            isAudioAutoplayFailed = false;
            btn.remove();
         };
         document.body.append(btn);
      };
   }, []);

   // @ts-ignore
   useEffect(() => {
      void init();
      return () => close();
   }, []);

   useEffect(() => {
      if (!isStreamer && rtcClient) {
         if (localStream) {
            closeLocalStream();
         }
      }
   }, [isStreamer, rtcClient]);

   useEffect(() => {
      dispatch(
         actions.setSessionIsUsingCloudProxy(Boolean(sessionIsUsingCloudProxy))
      );
   }, [sessionIsUsingCloudProxy]);

   const init = async () => {
      return joinAgoraRoomWithPrimaryClient(sessionIsUsingCloudProxy);
   };

   const close = async () => {
      return leaveAgoraRoom();
   };

   const handleReconnectAgora = async () => {
      await close();
      await init();
   };

   const updateScreenShareRtcClient = (newScreenShareRtcClient) => {
      screenShareRtcClientRef.current = newScreenShareRtcClient;
   };

   const updateScreenShareStream = (newScreenShareStream) => {
      screenShareStreamRef.current = newScreenShareStream;
      setScreenShareStream(newScreenShareStream);
   };

   const handleEnableCloudProxy = async () => {
      try {
         await leaveAgoraRoom();
      } catch (e) {
         console.log("-> e in leaving Room", e);
      }

      try {
         const sessionShouldUseCloudProxy = true;
         console.log("-> Setting session is using cp true");
         setSessionIsUsingProxy(sessionShouldUseCloudProxy);
         await joinAgoraRoomWithPrimaryClient(sessionShouldUseCloudProxy);
      } catch (e) {
         console.log("-> e in joining Room with Proxy", e);
      }
   };

   const joinAgoraRoom = async (
      rtcClient: IAgoraRTCClient,
      roomId: string,
      userUid: string,
      isStreamer: boolean,
      sessionIsUsingCloudProxy: boolean
   ) => {
      let timeout;
      try {
         const cfToken = token || "";

         const { data } = await fetchAgoraRtcToken({
            isStreamer: isStreamer,
            uid: userUid,
            sentToken: cfToken.toString(),
            channelName: roomId,
            streamDocumentPath: path,
         });
         if (sessionIsUsingCloudProxy) {
            rtcClient.startProxyServer(3);
         } else {
            timeout = setTimeout(async () => {
               await handleEnableCloudProxy();
            }, RTC_CLIENT_JOIN_TIME_LIMIT);
         }
         console.log("-> JOINING CLIENT");
         await rtcClient.join(
            AGORA_APP_ID,
            roomId,
            data.token.rtcToken,
            userUid
         );
         console.log("-> JOINED CLIENT");
      } catch (error) {
         console.error("-> error in JOIN AGORA ROOM", error);
         dispatch(actions.setAgoraRtcError(error));
      }
      if (timeout) {
         clearTimeout(timeout);
      }
   };
   //
   const leaveAgoraRoom = async () => {
      console.log("-> LEAVING");

      try {
         if (clientIsUsingCloudProxy) {
            rtcClient.stopProxyServer();
         }
         if (rtcClient) {
            await rtcClient.leave();
         }
      } catch (error) {
         console.log(error);
      }
   };

   const joinAgoraRoomWithPrimaryClient = async (
      sessionIsUsingCloudProxy: boolean
   ) => {
      try {
         return await joinAgoraRoom(
            rtcClient,
            roomId,
            streamerId,
            isStreamer,
            sessionIsUsingCloudProxy
         );
      } catch (error) {
         dispatch(actions.setAgoraRtcError(error));
      }
   };

   const initializeLocalAudioStream = async () => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalStream((localStream) => ({
               ...localStream,
               audioTrack: localAudio,
            }));
            resolve();
         } catch (error) {
            console.log("-> error", error);
            dispatch(actions.setAgoraRtcError(error));
            reject(error);
         }
      });
   };

   const initializeLocalVideoStream = async () => {
      return new Promise<void>(async (resolve, reject) => {
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
      setLocalStream((localStream) => ({
         ...localStream,
         isAudioPublished: false,
         isVideoPublished: false,
         videoTrack: null,
         audioTrack: null,
      }));
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
         return new Promise<void>(async (resolve, reject) => {
            try {
               if (streamType === "screen" || !rtcClientHost) {
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
      return new Promise<void>(async (resolve, reject) => {
         try {
            let localStreamTracks = [localStream.videoTrack];
            await publishTracks(rtcClient, localStreamTracks, "video");
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
      return new Promise<void>(async (resolve, reject) => {
         try {
            if (localStream.videoTrack) {
               if (localStream.isVideoPublished) {
                  let localStreamTracks = [localStream.videoTrack];
                  await rtcClient.unpublish(localStreamTracks);
                  await rtcClient.disableDualStream();
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
      return new Promise<void>(async (resolve, reject) => {
         try {
            let localStreamTracks = [localStream.audioTrack];
            await publishTracks(rtcClient, localStreamTracks, "audio");
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
      return new Promise<void>(async (resolve, reject) => {
         try {
            if (localStream.audioTrack) {
               if (localStream.isAudioPublished) {
                  let localStreamTracks = [localStream.audioTrack];
                  await rtcClient.unpublish(localStreamTracks);
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

   const returnToAudience = async () => {
      if (rtcClient) {
         await rtcClient.setClientRole("audience");
      }
   };

   const publishScreenShareStream = useCallback(
      async (screenSharingMode, onScreenShareStopped) => {
         return new Promise<void>(async (resolve, reject) => {
            try {
               const screenShareUid = `${streamerId}screen`;
               await joinAgoraRoom(
                  screenShareRtcClient,
                  roomId,
                  screenShareUid,
                  true,
                  sessionIsUsingCloudProxy
               );
               await publishScreenShareTracks(
                  screenShareRtcClient,
                  screenSharingMode,
                  onScreenShareStopped
               );
               updateScreenShareRtcClient(screenShareRtcClient);
               resolve();
            } catch (error) {
               reject(error);
            }
         });
      },
      [sessionIsUsingCloudProxy, screenShareRtcClient, streamerId, roomId]
   );

   const unpublishScreenShareStream = async () => {
      return new Promise<void>(async (resolve, reject) => {
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
      screenShareRtcClient,
      screenSharingMode,
      onScreenShareStopped
   ) => {
      let screenShareTracks = await getScreenShareStream(
         screenSharingMode,
         onScreenShareStopped
      );
      updateScreenShareStream(screenShareTracks);
      return publishTracks(screenShareRtcClient, screenShareTracks, "screen");
   };

   const getScreenShareStream = async (
      screenSharingMode: string,
      onScreenShareStopped: () => void
   ) => {
      return new Promise(async (resolve, reject) => {
         let screenShareVideoResolution: ScreenVideoTrackInitConfig["encoderConfig"] =
            screenSharingMode === "motion" ? "720p_2" : "1080p_1";
         try {
            const tracksObject = await AgoraRTC.createScreenVideoTrack(
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

   const localMediaHandlers = useMemo(
      () => ({
         initializeLocalAudioStream,
         initializeLocalVideoStream,
         closeLocalCameraTrack,
         closeLocalMicrophoneTrack,
      }),
      [
         localStream.videoTrack,
         localStream.isVideoPublished,
         localStream.audioTrack,
         localStream.isAudioPublished,
      ]
   );

   return {
      networkQuality,
      localStream,
      localMediaHandlers,
      localMediaControls: { setLocalAudioEnabled, setLocalVideoEnabled },
      remoteStreams,
      publishLocalStreamTracks: {
         publishLocalCameraTrack,
         publishLocalMicrophoneTrack,
         returnToAudience,
      },
      publishScreenShareStream,
      unpublishScreenShareStream,
      leaveAgoraRoom,
      handleEnableCloudProxy,
      handleReconnectAgora,
   };
}
