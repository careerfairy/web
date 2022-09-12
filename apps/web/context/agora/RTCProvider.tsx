import React, {
   memo,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import RTCContext, { RtcPropsInterface } from "./RTCContext"
import AgoraRTC, {
   IAgoraRTCClient,
   ILocalAudioTrack,
   ILocalTrack,
   ILocalVideoTrack,
   ScreenVideoTrackInitConfig,
   UID,
} from "agora-rtc-sdk-ng"
import { agoraServiceInstance } from "../../data/agora/AgoraService"
import { useRouter } from "next/router"

import useStreamRef from "../../components/custom-hook/useStreamRef"

import { useFirebaseService } from "../firebase/FirebaseServiceContext"
import { useSessionStorage } from "react-use"
import { useDispatch, useSelector } from "react-redux"
import RootState from "../../store/reducers"
import { LocalStream } from "../../types/streaming"
import useAgoraClientConfig from "../../components/custom-hook/useAgoraClientConfig"
import { sleep } from "../../components/helperFunctions/HelperFunctions"
import { RTC_CLIENT_JOIN_TIME_LIMIT } from "../../constants/streams"
import * as actions from "../../store/actions"
import useAgoraError from "../../components/custom-hook/useAgoraError"
import { errorLogAndNotify } from "../../util/CommonUtil"

const useRtcClient = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
})
const useScreenShareRtc = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
})
const RTCProvider: React.FC<RtcPropsInterface> = ({
   children,
   appId,
   isStreamer,
   uid,
   initialize,
   isAHandRaiser,
   channel,
}) => {
   console.count("-> RTCProvider")
   const { path } = useStreamRef()
   const router = useRouter()
   const rtcClient = useRtcClient()
   const screenShareRtcClient = useScreenShareRtc()
   const { handleRtcError, handleDeviceError, handleScreenShareDeniedError } =
      useAgoraError()
   const [sessionShouldUseCloudProxy, setSessionShouldUseProxy] =
      useSessionStorage<boolean>("is-using-cloud-proxy", false)
   const sessionIsUsingCloudProxy = useSelector((state: RootState) => {
      return state.stream.agoraState.sessionIsUsingCloudProxy
   })

   const [localStream, setLocalStream] = useState<LocalStream>({
      uid: uid,
      isAudioPublished: false,
      isVideoPublished: false,
      isLocal: true,
      videoTrack: null,
      audioTrack: null,
   })
   const [rtcClientHost, setPrimaryRtcClientHost] = useState(false)
   const returnToAudience = useCallback(() => {
      return rtcClient.setClientRole("audience").catch(handleRtcError)
   }, [handleRtcError, rtcClient])

   const returnToHost = useCallback(() => {
      return rtcClient.setClientRole("host").catch(handleRtcError)
   }, [handleRtcError, rtcClient])

   const { fetchAgoraRtcToken } = useFirebaseService()
   const dispatch = useDispatch()
   const [screenShareStream] = useState<
      ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack]
   >(null)

   const screenShareRtcClientRef = useRef(screenShareRtcClient)
   const screenShareStreamRef = useRef(screenShareStream)

   const { remoteStreams, networkQuality, demoStreamHandlers } =
      useAgoraClientConfig(rtcClient, uid)

   useEffect(() => {
      AgoraRTC.onAutoplayFailed = () => {
         dispatch(actions.setVideoIsPaused())
      }
   }, [dispatch])

   const leaveAgoraRoom = useCallback(async () => {
      console.log("-> LEAVING")
      try {
         if (rtcClient) {
            await rtcClient.leave()
            if (sessionIsUsingCloudProxy) {
               rtcClient.stopProxyServer()
            }
            rtcClient.removeAllListeners()
         }
      } catch (error) {
         console.log(error)
      }
   }, [rtcClient, sessionIsUsingCloudProxy])
   const joinAgoraRoom = useCallback(
      async (
         rtcClient: IAgoraRTCClient,
         roomId: string,
         userUid: UID,
         isStreamer: boolean,
         sessionShouldUseCloudProxy: boolean
      ) => {
         let timeout
         try {
            const cfToken = router.query.token || ""
            const { data } = await fetchAgoraRtcToken({
               isStreamer: isAHandRaiser ? false : isStreamer,
               uid: userUid,
               sentToken: cfToken.toString(),
               channelName: roomId,
               streamDocumentPath: path,
            })
            if (sessionShouldUseCloudProxy) {
               rtcClient.startProxyServer(3)
            } else {
               timeout = setTimeout(async () => {
                  // Start reconnecting with Cloud Proxy Process
                  logStatus("LEAVE", false, sessionShouldUseCloudProxy)
                  await rtcClient.leave()
                  rtcClient.removeAllListeners()
                  logStatus("LEAVE", true, sessionShouldUseCloudProxy)

                  // Normally client.leave() method should abort the initial join according to the docs.
                  // But that is not the case, so one must wait/sleep a bit before re-joining
                  await sleep(2000)
                  setSessionShouldUseProxy(sessionShouldUseCloudProxy)
                  rtcClient.startProxyServer(3)
                  return rtcClient
                     .join(appId, roomId, data.token.rtcToken, userUid)
                     .catch((err) => {
                        handleRtcError(err, {
                           type: "JOIN",
                           isUsingProxy: true,
                        })
                     })
               }, RTC_CLIENT_JOIN_TIME_LIMIT)
            }
            logStatus("JOIN", false, sessionShouldUseCloudProxy)

            await rtcClient
               .join(appId, roomId, data.token.rtcToken, userUid)
               .then(() => logStatus("JOIN", true, sessionShouldUseCloudProxy))
               .catch((err) => {
                  logStatus("JOIN", false, sessionShouldUseCloudProxy, err)
                  handleRtcError(err)
               })
         } catch (error) {
            errorLogAndNotify(error)
         }
         if (timeout) {
            clearTimeout(timeout)
         }
      },
      [
         appId,
         fetchAgoraRtcToken,
         handleRtcError,
         isAHandRaiser,
         path,
         router.query.token,
         setSessionShouldUseProxy,
      ]
   )
   const joinAgoraRoomWithPrimaryClient = useCallback(
      async (sessionShouldUseCloudProxy: boolean) =>
         joinAgoraRoom(
            rtcClient,
            channel,
            uid,
            isStreamer,
            sessionShouldUseCloudProxy
         )
            .then(() => {
               dispatch(actions.setAgoraPrimaryClientJoined(true))
            })
            .catch((err) => {
               errorLogAndNotify(err)
               dispatch(actions.setAgoraPrimaryClientJoined(false))
            }),
      [joinAgoraRoom, rtcClient, channel, uid, isStreamer, dispatch]
   )

   const close = useCallback(async () => {
      return leaveAgoraRoom()
   }, [leaveAgoraRoom])
   const init = useCallback(async () => {
      return joinAgoraRoomWithPrimaryClient(sessionShouldUseCloudProxy)
   }, [joinAgoraRoomWithPrimaryClient, sessionShouldUseCloudProxy])
   // @ts-ignore
   useEffect(() => {
      if (initialize) {
         void init()
         return () => close()
      }
   }, [close, init, initialize])

   const closeAndUnpublishedLocalStream = useCallback(async () => {
      if (localStream) {
         let tracks = []
         if (localStream.videoTrack) {
            tracks.push(localStream.videoTrack)
         }
         if (localStream.audioTrack) {
            tracks.push(localStream.audioTrack)
         }
         try {
            if (tracks.length) {
               await rtcClient.unpublish(tracks)
               for (const track of tracks) {
                  if (track.trackMediaType === "video") {
                     await rtcClient.disableDualStream()
                  }
                  track.close()
               }
            }
            await returnToAudience()
         } catch (error) {
            handleRtcError(error)
         }
         setLocalStream((localStream) => ({
            ...localStream,
            isAudioPublished: false,
            isVideoPublished: false,
            videoTrack: null,
            audioTrack: null,
            videoMuted: false,
            audioMuted: false,
         }))
      }
   }, [localStream, returnToAudience, rtcClient, handleRtcError])
   useEffect(() => {
      if (!isStreamer && rtcClient) {
         if (localStream) {
            void closeAndUnpublishedLocalStream()
         }
      }
   }, [closeAndUnpublishedLocalStream, isStreamer, localStream, rtcClient])

   const updateScreenShareRtcClient = (newScreenShareRtcClient) => {
      screenShareRtcClientRef.current = newScreenShareRtcClient
   }

   const updateScreenShareStream = useCallback(
      (
         newScreenShareStream:
            | ILocalVideoTrack
            | [ILocalVideoTrack, ILocalAudioTrack]
      ) => {
         screenShareStreamRef.current = newScreenShareStream
      },
      []
   )

   const logStatus = (
      type: "JOIN" | "LEAVE",
      isSuccess: boolean,
      isUsingProxy: boolean,
      error?: any
   ) => {
      const proxyStatus = isUsingProxy ? "WITH" : "WITHOUT"
      const successMessage = isSuccess ? "SUCCESS" : ""
      const errorMessage = error ? "ERROR IN" : ""
      return console.log(
         `-> ${errorMessage} ${type} CLIENT ${proxyStatus} PROXY ${successMessage}`,
         error || ""
      )
   }

   const initializeLocalAudioStream = useCallback(async () => {
      return AgoraRTC.createMicrophoneAudioTrack({
         ...(router.query.withHighQuality && {
            encoderConfig: "high_quality_stereo",
         }),
      })
         .then((audioTrack) => {
            setLocalStream((localStream) => ({
               ...localStream,
               uid,
               audioTrack: audioTrack,
            }))
         })
         .catch((err) => {
            handleDeviceError(err, "microphone")
         })
   }, [handleDeviceError, router.query.withHighQuality, uid])

   const initializeLocalVideoStream = useCallback(async () => {
      return AgoraRTC.createCameraVideoTrack({
         encoderConfig: router.query.withHighQuality ? "720p_3" : "480p_9",
      })
         .then((videoTrack) => {
            setLocalStream((localStream) => ({
               ...localStream,
               uid,
               videoTrack: videoTrack,
            }))
         })
         .catch((err) => handleDeviceError(err, "camera"))
   }, [handleDeviceError, router.query.withHighQuality, uid])

   const setLocalAudioEnabled = useCallback(
      async (value) =>
         localStream.audioTrack
            .setEnabled(value)
            .then(() => {
               setLocalStream((localStream) => ({
                  ...localStream,
                  audioMuted: !value,
               }))
            })
            .catch(handleRtcError),
      [handleRtcError, localStream.audioTrack]
   )

   const setLocalVideoEnabled = useCallback(
      async (value) =>
         localStream.videoTrack
            .setEnabled(value)
            .then(() => {
               setLocalStream((localStream) => ({
                  ...localStream,
                  videoMuted: !value,
               }))
            })
            .catch(handleRtcError),
      [handleRtcError, localStream.videoTrack]
   )

   const publishTracks = useCallback(
      async (
         client: IAgoraRTCClient,
         tracks: ILocalTrack | ILocalTrack[],
         streamType: "video" | "audio" | "screen"
      ) => {
         if (tracks) {
            try {
               if (streamType === "screen" || !rtcClientHost) {
                  await client.setClientRole("host")
               }
               await client.publish(tracks)
               if (streamType === "video") {
                  await client.enableDualStream()
               }
               if (streamType === "audio") {
                  client.enableAudioVolumeIndicator()
               }
               setPrimaryRtcClientHost(true)
            } catch (error) {
               handleRtcError(error)
            }
         }
      },
      [handleRtcError, rtcClientHost]
   )

   const publishLocalCameraTrack = useCallback(() => {
      return publishTracks(rtcClient, [localStream.videoTrack], "video")
         .then(() => {
            setLocalStream((localStream) => ({
               ...localStream,
               isVideoPublished: true,
            }))
         })
         .catch(errorLogAndNotify)
   }, [localStream.videoTrack, publishTracks, rtcClient])

   const closeLocalCameraTrack = useCallback(async () => {
      try {
         if (localStream.videoTrack) {
            if (localStream.isVideoPublished) {
               let localStreamTracks = [localStream.videoTrack]
               await rtcClient.unpublish(localStreamTracks)
               await rtcClient.disableDualStream()
            }
            localStream.videoTrack.close()
            setLocalStream((localStream) => ({
               ...localStream,
               videoTrack: null,
               isVideoPublished: false,
            }))
         }
      } catch (error) {
         handleRtcError(error)
      }
   }, [
      handleRtcError,
      localStream.isVideoPublished,
      localStream.videoTrack,
      rtcClient,
   ])

   const publishLocalMicrophoneTrack = useCallback(() => {
      return publishTracks(rtcClient, [localStream.audioTrack], "audio")
         .then(() => {
            setLocalStream((localStream) => ({
               ...localStream,
               isAudioPublished: true,
            }))
         })
         .catch(errorLogAndNotify)
   }, [localStream.audioTrack, publishTracks, rtcClient])

   const closeLocalMicrophoneTrack = useCallback(async () => {
      try {
         if (localStream.audioTrack) {
            if (localStream.isAudioPublished) {
               let localStreamTracks = [localStream.audioTrack]
               try {
                  await rtcClient.unpublish(localStreamTracks)
               } catch (e) {
                  handleRtcError(e)
               }
            }
            setLocalStream((localStream) => ({
               ...localStream,
               audioTrack: null,
               isAudioPublished: false,
            }))
            setPrimaryRtcClientHost(false)
            localStream.audioTrack.close()
         }
      } catch (error) {
         errorLogAndNotify(error)
      }
   }, [
      handleRtcError,
      localStream.audioTrack,
      localStream.isAudioPublished,
      rtcClient,
   ])

   const publishScreenShareTracks = useCallback(
      async (screenShareTracks, screenShareRtcClient) => {
         try {
            return publishTracks(
               screenShareRtcClient,
               screenShareTracks,
               "screen"
            )
         } catch (e) {
            console.error(e)
         }
      },
      [publishTracks]
   )

   const getScreenShareStream = useCallback(
      async (screenSharingMode: string, onScreenShareStopped: () => void) => {
         let screenShareVideoResolution: ScreenVideoTrackInitConfig["encoderConfig"] =
            screenSharingMode === "motion" ? "720p_2" : "1080p_1"
         try {
            const tracksObject = await AgoraRTC.createScreenVideoTrack(
               {
                  encoderConfig: screenShareVideoResolution,
               },
               "auto"
            )
            const videoTrack = Array.isArray(tracksObject)
               ? tracksObject[0]
               : tracksObject
            videoTrack.on("track-ended", onScreenShareStopped)
            return tracksObject
         } catch (error) {
            handleScreenShareDeniedError(error)
         }
      },
      [handleScreenShareDeniedError]
   )

   const publishScreenShareStream = useCallback(
      async (screenSharingMode, onScreenShareStopped) => {
         try {
            const screenShareUid = `${uid}screen`
            const screenShareTracks = await getScreenShareStream(
               screenSharingMode,
               onScreenShareStopped
            )
            updateScreenShareStream(screenShareTracks)

            await joinAgoraRoom(
               screenShareRtcClient,
               channel,
               screenShareUid,
               true,
               sessionShouldUseCloudProxy
            )
            await publishScreenShareTracks(
               screenShareTracks,
               screenShareRtcClient
            )
            updateScreenShareRtcClient(screenShareRtcClient)
         } catch (error) {
            errorLogAndNotify(error)
         }
      },
      [
         uid,
         getScreenShareStream,
         updateScreenShareStream,
         joinAgoraRoom,
         screenShareRtcClient,
         channel,
         sessionShouldUseCloudProxy,
         publishScreenShareTracks,
      ]
   )

   const unPublishScreenShareStream = useCallback(async () => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            let screenShareRtcClient = screenShareRtcClientRef.current
            let screenShareStream = screenShareStreamRef.current
            await screenShareRtcClient.unpublish(screenShareStream)
            if (Array.isArray(screenShareStream)) {
               screenShareStream.forEach((track) => track.close())
            } else {
               screenShareStream.close()
            }
            await screenShareRtcClient.leave()
            updateScreenShareStream(null)
            resolve()
         } catch (error) {
            reject(error)
         }
      })
   }, [updateScreenShareStream])

   const handlePublishLocalStream = useCallback(async () => {
      await returnToHost()
      if (localStream.audioTrack && !localStream.isAudioPublished) {
         await publishLocalMicrophoneTrack()
      }
      if (localStream.videoTrack && !localStream.isVideoPublished) {
         await publishLocalCameraTrack()
      }

      await dispatch(actions.setStreamerIsPublished(true))
   }, [
      returnToHost,
      localStream.audioTrack,
      localStream.isAudioPublished,
      localStream.videoTrack,
      localStream.isVideoPublished,
      dispatch,
      publishLocalMicrophoneTrack,
      publishLocalCameraTrack,
   ])

   const handleReconnectAgora = useCallback(
      async (options: { rePublish?: boolean }) => {
         await close()
         await init()
         if (options.rePublish) {
            try {
               await closeLocalCameraTrack()
               await closeLocalMicrophoneTrack()
               await handlePublishLocalStream()
            } catch (e) {
               console.log("-> error in Republish in reconnect", e)
            }
         }
      },
      [
         close,
         closeLocalCameraTrack,
         closeLocalMicrophoneTrack,
         handlePublishLocalStream,
         init,
      ]
   )

   const localMediaHandlers = useMemo(
      () => ({
         initializeLocalAudioStream,
         initializeLocalVideoStream,
         closeLocalCameraTrack,
         closeLocalMicrophoneTrack,
      }),
      [
         initializeLocalAudioStream,
         initializeLocalVideoStream,
         closeLocalCameraTrack,
         closeLocalMicrophoneTrack,
      ]
   )

   const publishLocalStreamTracks = useMemo(
      () => ({
         publishLocalCameraTrack,
         publishLocalMicrophoneTrack,
         returnToAudience,
      }),
      [publishLocalCameraTrack, publishLocalMicrophoneTrack, returnToAudience]
   )

   const localMediaControls = useMemo(
      () => ({ setLocalAudioEnabled, setLocalVideoEnabled }),
      [setLocalAudioEnabled, setLocalVideoEnabled]
   )

   const value = useMemo(
      () => ({
         localStream,
         screenShareStream,
         rtcClient,
         screenShareRtcClient,
         localMediaHandlers,
         publishLocalStreamTracks,
         localMediaControls,
         handleReconnectAgora,
         handlePublishLocalStream,
         publishScreenShareStream,
         unPublishScreenShareStream,
         networkQuality,
         remoteStreams,
         screenShareStreamRef,
         leaveAgoraRoom,
         closeAndUnpublishedLocalStream,
         demoStreamHandlers,
      }),
      [
         localStream,
         screenShareStream,
         rtcClient,
         screenShareRtcClient,
         localMediaHandlers,
         publishLocalStreamTracks,
         localMediaControls,
         handleReconnectAgora,
         handlePublishLocalStream,
         publishScreenShareStream,
         unPublishScreenShareStream,
         networkQuality,
         remoteStreams,
         leaveAgoraRoom,
         closeAndUnpublishedLocalStream,
         demoStreamHandlers,
      ]
   )
   return (
      <RTCContext.Provider value={value}>
         {init ? children : null}
      </RTCContext.Provider>
   )
}

export const useRtc = () => {
   const context = useContext(RTCContext)
   if (context === undefined) {
      throw new Error("useRtc must be used within a RtcProvider")
   }
   return context
}

export default memo(RTCProvider)
