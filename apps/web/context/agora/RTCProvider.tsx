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
import { useDispatch, useSelector } from "react-redux"
import { LocalStream } from "../../types/streaming"
import useAgoraClientConfig from "../../components/custom-hook/useAgoraClientConfig"
import * as actions from "../../store/actions"
import useAgoraError from "../../components/custom-hook/useAgoraError"
import { errorLogAndNotify, isMobileBrowser } from "../../util/CommonUtil"
import {
   sessionIsUsingCloudProxySelector,
   sessionShouldUseCloudProxySelector,
   streamerBreakoutRoomModalOpen,
} from "../../store/selectors/streamSelectors"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { setVideoEffectsOff } from "store/actions/streamActions"

const useRtcClient = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
})

const useScreenShareRtc = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
})

const RTCProvider = ({
   children,
   appId,
   isStreamer,
   uid,
   initialize,
   channel,
   screenSharerId,
   streamMode,
}: RtcPropsInterface) => {
   const streamRef = useStreamRef()
   const router = useRouter()
   const rtcClient = useRtcClient()
   const { remoteStreams, networkQuality, demoStreamHandlers } =
      useAgoraClientConfig(rtcClient, uid)
   const screenShareRtcClient = useScreenShareRtc()
   const { handleRtcError, handleDeviceError, handleScreenShareDeniedError } =
      useAgoraError()
   const sessionShouldUseCloudProxy = useSelector(
      sessionShouldUseCloudProxySelector
   )

   // Due to the way we are using this hook, we need to know
   // whether the sessionShouldUseCloudProxy, it's initial state is undefined
   const shouldInit = initialize && sessionShouldUseCloudProxy !== undefined

   const sessionIsUsingCloudProxy = useSelector(
      sessionIsUsingCloudProxySelector
   )

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

   const { fetchAgoraRtcToken, setDesktopMode: setDesktopModeInstanceMethod } =
      useFirebaseService()
   const dispatch = useDispatch()
   const [screenShareStream] = useState<
      ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack]
   >(null)

   const screenShareRtcClientRef = useRef(screenShareRtcClient)
   const screenShareStreamRef = useRef(screenShareStream)

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
         errorLogAndNotify(error)
      }
   }, [sessionIsUsingCloudProxy])

   const joinAgoraRoom = useCallback(
      async (
         rtcClient: IAgoraRTCClient,
         roomId: string,
         userUid: UID,
         isStreamer: boolean,
         sessionShouldUseCloudProxy: boolean
      ) => {
         let timeout
         const cfToken = router.query.token || ""
         const { data } = await fetchAgoraRtcToken({
            isStreamer: isStreamer,
            uid: userUid,
            sentToken: cfToken.toString(),
            channelName: roomId,
            streamDocumentPath: streamRef.path,
         })
         if (sessionShouldUseCloudProxy) {
            const mode = Boolean(router.query.withTCPProxy) ? 5 : 3
            rtcClient.startProxyServer(mode)
         }
         logStatus("JOIN", false, sessionShouldUseCloudProxy)

         try {
            await rtcClient.join(appId, roomId, data.token.rtcToken, userUid)
         } catch (err) {
            logStatus("JOIN", false, sessionShouldUseCloudProxy, err)
            handleRtcError(err)
            throw err
         }

         logStatus("JOIN", true, sessionShouldUseCloudProxy)
         if (timeout) {
            clearTimeout(timeout)
         }
      },
      [
         appId,
         fetchAgoraRtcToken,
         handleRtcError,
         streamRef.path,
         router.query.token,
         router.query.withTCPProxy,
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
      if (shouldInit) {
         void init()
         return () => close()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [shouldInit])

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
                  if (track.trackMediaType === "video" && !isMobileBrowser()) {
                     await disableDualStream(rtcClient)
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
         encoderConfig: getVideoEncoderPreset(
            router.query.withHighQuality
         ) as any,
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
               if (streamType === "video") {
                  enableDualStream(client).catch(errorLogAndNotify)
               }
               await client.publish(tracks)
               setPrimaryRtcClientHost(true)
            } catch (error) {
               handleRtcError(error)
               throw error
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

               disableDualStream(rtcClient).catch(console.error)
            }
            localStream.videoTrack.close()
            setLocalStream((localStream) => ({
               ...localStream,
               videoTrack: null,
               isVideoPublished: false,
            }))
            dispatch(setVideoEffectsOff())
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
      async (screenShareTracks, screenShareRtcClient) =>
         publishTracks(screenShareRtcClient, screenShareTracks, "screen"),
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
            throw error
         }
      },
      [handleScreenShareDeniedError]
   )

   const publishScreenShareStream = useCallback(
      async (screenSharingMode, onScreenShareStopped) => {
         let screenShareTracks
         try {
            const screenShareUid = `${uid}screen`
            screenShareTracks = await getScreenShareStream(
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
            if (screenShareRtcClient) {
               screenShareRtcClient.leave().catch(errorLogAndNotify)
               updateScreenShareRtcClient(null)
            }

            if (screenShareTracks) {
               if (Array.isArray(screenShareTracks)) {
                  screenShareTracks.forEach((track) =>
                     track.close().catch(errorLogAndNotify)
                  )
               } else {
                  screenShareTracks.close().catch(errorLogAndNotify)
               }
               updateScreenShareStream(null)
            }

            errorLogAndNotify(error)
            throw error
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
      try {
         let screenShareRtcClient = screenShareRtcClientRef.current
         let screenShareStream = screenShareStreamRef.current

         await screenShareRtcClient.unpublish(screenShareStream)
         if (Array.isArray(screenShareStream)) {
            screenShareStream.forEach((track) => track.close())
         } else {
            screenShareStream?.close()
         }
         await screenShareRtcClient.leave()
         updateScreenShareStream(null)
      } catch (error) {
         errorLogAndNotify(error, {
            message: "Failed to unpublish screenshare",
         })
         throw error
      }
   }, [updateScreenShareStream])

   const setDesktopMode = useCallback(
      async (mode: LivestreamEvent["mode"], initiatorId: string) => {
         let sharerId = mode === "desktop" ? initiatorId : screenSharerId
         await setDesktopModeInstanceMethod(
            streamRef,
            mode,
            sharerId || initiatorId
         )
      },
      [screenSharerId, setDesktopModeInstanceMethod, streamRef]
   )

   const onScreenShareStopped = useCallback(() => {
      unPublishScreenShareStream()
         .then(async () => {
            await setDesktopMode("default", uid)
         })
         .catch((e) =>
            errorLogAndNotify(e, {
               message: "Enable to unpublish screen share",
            })
         )
   }, [setDesktopMode, uid, unPublishScreenShareStream])

   const handleScreenShare = useCallback(
      async (optimizationMode = "detail") => {
         try {
            if (streamMode === "desktop") {
               await unPublishScreenShareStream()
               await setDesktopMode("default", uid)
            } else {
               await publishScreenShareStream(
                  optimizationMode,
                  onScreenShareStopped
               )
               await setDesktopMode("desktop", uid)
            }
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error in screen share",
            })
         }
      },
      [
         streamMode,
         unPublishScreenShareStream,
         setDesktopMode,
         uid,
         publishScreenShareStream,
         onScreenShareStopped,
      ]
   )

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

   /**
    * Prompt confirmation before leaving the page
    * Only for streamers sharing video and when the breakout room dialog is not open
    */
   const breakoutRoomDialogOpen = useSelector(streamerBreakoutRoomModalOpen)
   const shouldWarnBeforeLeave = Boolean(
      !breakoutRoomDialogOpen && // may be switching to a breakout room
         localStream?.videoTrack && // sharing video
         !localStream?.videoMuted // allow leaving with the camera turned off
   )
   useBeforeLeaveConfirmation(shouldWarnBeforeLeave)

   const value = useMemo(
      () => ({
         localStream,
         screenShareStream,
         rtcClient,
         screenShareRtcClient,
         localMediaHandlers,
         publishLocalStreamTracks,
         localMediaControls,
         handlePublishLocalStream,
         unPublishScreenShareStream,
         networkQuality,
         remoteStreams,
         screenShareStreamRef,
         leaveAgoraRoom,
         closeAndUnpublishedLocalStream,
         demoStreamHandlers,
         setDesktopMode,
         handleScreenShare,
      }),
      [
         localStream,
         screenShareStream,
         rtcClient,
         screenShareRtcClient,
         localMediaHandlers,
         publishLocalStreamTracks,
         localMediaControls,
         handlePublishLocalStream,
         unPublishScreenShareStream,
         networkQuality,
         remoteStreams,
         leaveAgoraRoom,
         closeAndUnpublishedLocalStream,
         demoStreamHandlers,
         setDesktopMode,
         handleScreenShare,
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

// Agora doesn't recommend enabling dual streams on mobile browsers
// https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#enabledualstream
function enableDualStream(client: IAgoraRTCClient) {
   if (isMobileBrowser()) return Promise.resolve()

   return client.enableDualStream()
}

function disableDualStream(client: IAgoraRTCClient) {
   if (isMobileBrowser()) return Promise.resolve()

   return client.disableDualStream()
}

/**
 * Get the video encoder quality from the url query param withHighQuality
 * Defaults to if not present 480p_9
 *
 * https://api-ref.agora.io/en/voice-sdk/web/4.x/globals.html#videoencoderconfigurationpreset
 * @param withHighQuality
 */
export function getVideoEncoderPreset(
   withHighQuality: string | string[]
): string {
   if (!withHighQuality) return "480p_9"

   if (/^\d{3,4}p(_\d)?$/.test(withHighQuality + "")) {
      // matches a preset format
      return withHighQuality + ""
   }

   // high quality default preset
   return "720p_3"
}

const useBeforeLeaveConfirmation = (enabled: boolean) => {
   useEffect(() => {
      if (!enabled) return
      const beforeUnloadListener = (event) => {
         event.preventDefault()
         return (event.returnValue = "Are you sure you want to leave?")
      }

      window.addEventListener("beforeunload", beforeUnloadListener, {
         capture: false,
      })

      return () => {
         window.removeEventListener("beforeunload", beforeUnloadListener, {
            capture: false,
         })
      }
   }, [enabled])
}

export default memo(RTCProvider)
