import React, {
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import RtcContext, { RtcPropsInterface } from "./RtcContext"
import AgoraRTC, {
   IAgoraRTCClient,
   ILocalAudioTrack,
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

const useRtcClient = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
})
const useScreenShareRtc = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
})
const RtcProvider: React.FC<RtcPropsInterface> = ({
   children,
   appId,
   isStreamer,
   uid,
   initialize,
   isAHandRaiser,
   channel,
}) => {
   const { path } = useStreamRef()
   const router = useRouter()
   const rtcClient = useRtcClient()
   const screenShareRtcClient = useScreenShareRtc()
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

   const { fetchAgoraRtcToken } = useFirebaseService()
   const dispatch = useDispatch()
   const [screenShareStream, setScreenShareStream] = useState<
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
   }, [])

   // @ts-ignore
   useEffect(() => {
      if (initialize) {
         void init()
         return () => close()
      }
   }, [initialize])

   useEffect(() => {
      if (!isStreamer && rtcClient) {
         if (localStream) {
            void closeAndUnpublishedLocalStream()
         }
      }
   }, [isStreamer, rtcClient])

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
                  logStatus("LEAVE", true, sessionShouldUseCloudProxy)

                  // Normally client.leave() method should abort the initial join according to the docs.
                  // But that is not the case, so one must wait/sleep a bit before re-joining
                  await sleep(2000)
                  setSessionShouldUseProxy(sessionShouldUseCloudProxy)
                  rtcClient.startProxyServer(3)
                  try {
                     await rtcClient.join(
                        appId,
                        roomId,
                        data.token.rtcToken,
                        userUid
                     )
                  } catch (e) {
                     console.log("-> ERROR IN RECONNECT WITH Proxy", e)
                  }
                  return
               }, RTC_CLIENT_JOIN_TIME_LIMIT)
            }
            logStatus("JOIN", false, sessionShouldUseCloudProxy)

            await rtcClient.join(appId, roomId, data.token.rtcToken, userUid)
            logStatus("JOIN", true, sessionShouldUseCloudProxy)
         } catch (error) {
            logStatus("JOIN", false, sessionShouldUseCloudProxy, error)
            dispatch(actions.setAgoraRtcError(error))
         }
         if (timeout) {
            clearTimeout(timeout)
         }
      },
      [
         dispatch,
         fetchAgoraRtcToken,
         isAHandRaiser,
         path,
         router.query.token,
         setSessionShouldUseProxy,
      ]
   )

   const leaveAgoraRoom = useCallback(async () => {
      console.log("-> LEAVING")
      try {
         if (rtcClient) {
            await rtcClient.leave()
         }
         if (sessionIsUsingCloudProxy) {
            rtcClient.stopProxyServer()
         }
         rtcClient?.removeAllListeners?.()
      } catch (error) {
         console.log(error)
      }
   }, [sessionIsUsingCloudProxy])

   const close = useCallback(async () => {
      return leaveAgoraRoom()
   }, [leaveAgoraRoom])

   const joinAgoraRoomWithPrimaryClient = useCallback(
      async (sessionShouldUseCloudProxy: boolean) => {
         try {
            await joinAgoraRoom(
               rtcClient,
               channel,
               uid,
               isStreamer,
               sessionShouldUseCloudProxy
            )
            return dispatch(actions.setAgoraPrimaryClientJoined(true))
         } catch (error) {
            dispatch(actions.setAgoraPrimaryClientJoined(false))
            dispatch(actions.setAgoraRtcError(error))
         }
      },
      [dispatch, isStreamer, joinAgoraRoom, channel, uid]
   )

   const initializeLocalAudioStream = async () => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            const localAudio = await AgoraRTC.createMicrophoneAudioTrack({
               ...(router.query.withHighQuality && {
                  encoderConfig: "high_quality_stereo",
               }),
            })
            setLocalStream((localStream) => ({
               ...localStream,
               uid,
               audioTrack: localAudio,
            }))
            resolve()
         } catch (error) {
            dispatch(actions.handleSetDeviceError(error, "microphone"))
            reject(error)
         }
      })
   }

   const initializeLocalVideoStream = async () => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            const localVideo = await AgoraRTC.createCameraVideoTrack({
               encoderConfig: router.query.withHighQuality
                  ? "720p_3"
                  : "480p_9",
            })
            setLocalStream((localStream) => ({
               ...localStream,
               uid,
               videoTrack: localVideo,
            }))
            resolve()
         } catch (error) {
            dispatch(actions.handleSetDeviceError(error, "camera"))
            reject(error)
         }
      })
   }

   const initializeVideoCameraAudioTrack = useCallback(async () => {
      let audioTrack = null
      let videoTrack = null

      try {
         audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            ...(router.query.withHighQuality && {
               encoderConfig: "high_quality_stereo",
            }),
         })
      } catch (error) {
         dispatch(actions.handleSetDeviceError(error, "microphone"))
      }

      try {
         videoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: router.query.withHighQuality ? "720p_3" : "480p_9",
         })
      } catch (error) {
         dispatch(actions.handleSetDeviceError(error, "camera"))
      }
      setLocalStream((localStream) => ({
         ...localStream,
         uid,
         audioTrack: audioTrack,
         videoTrack: videoTrack,
      }))
   }, [router.query.withHighQuality, uid])

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
            console.error(error)
            dispatch(actions.setAgoraRtcError(error))
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
   }, [rtcClient, localStream])

   const setLocalAudioEnabled = useCallback(
      async (value) => {
         try {
            await localStream.audioTrack.setEnabled(value)
            setLocalStream((localStream) => ({
               ...localStream,
               audioMuted: !value,
            }))
         } catch (e) {
            console.log("-> error in toggling mic", e)
         }
      },
      [localStream.audioTrack]
   )

   const init = useCallback(async () => {
      return joinAgoraRoomWithPrimaryClient(sessionShouldUseCloudProxy)
   }, [joinAgoraRoomWithPrimaryClient, sessionShouldUseCloudProxy])

   const setLocalVideoEnabled = useCallback(
      async (value) => {
         try {
            await localStream.videoTrack.setEnabled(value)
            setLocalStream((localStream) => ({
               ...localStream,
               videoMuted: !value,
            }))
         } catch (e) {
            console.log("-> error in toggling cam", e)
         }
      },
      [localStream.videoTrack]
   )

   const publishTracks = (client: IAgoraRTCClient, tracks, streamType) => {
      if (tracks) {
         return new Promise<void>(async (resolve, reject) => {
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
               resolve()
            } catch (error) {
               reject(error)
            }
         })
      }
   }

   const publishLocalCameraTrack = () => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            let localStreamTracks = [localStream.videoTrack]
            await publishTracks(rtcClient, localStreamTracks, "video")
            setLocalStream((localStream) => ({
               ...localStream,
               isVideoPublished: true,
            }))
            resolve()
         } catch (error) {
            reject(error)
         }
      })
   }

   const closeLocalCameraTrack = useCallback(() => {
      return new Promise<void>(async (resolve, reject) => {
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
            resolve()
         } catch (error) {
            reject(error)
         }
      })
   }, [localStream.isVideoPublished, localStream.videoTrack])

   const publishLocalMicrophoneTrack = () => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            let localStreamTracks = [localStream.audioTrack]
            await publishTracks(rtcClient, localStreamTracks, "audio")
            setLocalStream((localStream) => ({
               ...localStream,
               isAudioPublished: true,
            }))
            resolve()
         } catch (error) {
            reject(error)
         }
      })
   }

   const closeLocalMicrophoneTrack = useCallback(() => {
      return new Promise<void>(async (resolve, reject) => {
         try {
            if (localStream.audioTrack) {
               if (localStream.isAudioPublished) {
                  let localStreamTracks = [localStream.audioTrack]
                  try {
                     await rtcClient.unpublish(localStreamTracks)
                  } catch (e) {
                     console.log("-> error in unPublish", e)
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
            resolve()
         } catch (error) {
            reject(error)
         }
      })
   }, [localStream.audioTrack, localStream.isAudioPublished])

   const returnToAudience = async () => {
      return await rtcClient.setClientRole("audience")
   }

   const returnToHost = async () => {
      return await rtcClient.setClientRole("host")
   }

   const publishScreenShareStream = useCallback(
      async (screenSharingMode, onScreenShareStopped) => {
         return new Promise<void>(async (resolve, reject) => {
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
               resolve()
            } catch (error) {
               reject(error)
            }
         })
      },
      [sessionShouldUseCloudProxy, screenShareRtcClient, uid, channel]
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

   const publishScreenShareTracks = async (
      screenShareTracks,
      screenShareRtcClient
   ) => {
      try {
         return publishTracks(screenShareRtcClient, screenShareTracks, "screen")
      } catch (e) {
         console.error(e)
      }
   }

   const getScreenShareStream = async (
      screenSharingMode: string,
      onScreenShareStopped: () => void
   ): Promise<ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack]> => {
      return new Promise(async (resolve, reject) => {
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
            resolve(tracksObject)
         } catch (error) {
            dispatch(actions.handleScreenShareDeniedError(error))
         }
      })
   }

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
      localStream.audioTrack,
      localStream.videoTrack,
      localStream.isAudioPublished,
      localStream.isVideoPublished,
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
         initializeVideoCameraAudioTrack,
         closeLocalCameraTrack,
         closeLocalMicrophoneTrack,
      }),
      [
         localStream.videoTrack,
         localStream.isVideoPublished,
         localStream.audioTrack,
         localStream.isAudioPublished,
         router.query.withHighQuality,
      ]
   )

   const publishLocalStreamTracks = useMemo(
      () => ({
         publishLocalCameraTrack,
         publishLocalMicrophoneTrack,
         returnToAudience,
      }),
      [localStream.videoTrack, localStream.audioTrack, rtcClient]
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
      <RtcContext.Provider value={value}>
         {init ? children : null}
      </RtcContext.Provider>
   )
}

export const useRtc = () => {
   const context = useContext(RtcContext)
   if (context === undefined) {
      throw new Error("useRtc must be used within a RtcProvider")
   }
   return context
}

export default RtcProvider
