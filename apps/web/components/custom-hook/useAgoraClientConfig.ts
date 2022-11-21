import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import * as actions from "../../store/actions"
import {
   IAgoraRTCClient,
   IAgoraRTCRemoteUser,
   NetworkQuality,
   UID,
} from "agora-rtc-sdk-ng"
import { IRemoteStream } from "types/streaming"
import useAgoraError from "./useAgoraError"
import { useSessionStorage } from "react-use"
import { errorLogAndNotify } from "../../util/CommonUtil"

export const SESSION_PROXY_KEY = "should-use-cloud-proxy"

export default function useAgoraClientConfig(
   rtcClient: IAgoraRTCClient,
   streamerId: UID
) {
   const [remoteStreams, setRemoteStreams] = useState<IRemoteStream[]>([])
   const [networkQuality, setNetworkQuality] = useState<NetworkQuality>({
      downlinkNetworkQuality: 0,
      uplinkNetworkQuality: 0,
   })
   const [sessionShouldUseCloudProxy, setSessionShouldUseProxy] =
      useSessionStorage<boolean>(SESSION_PROXY_KEY, false)

   const { handleRtcError } = useAgoraError()

   const dispatch = useDispatch()

   const handleSessionShouldUseCloudProxy = useCallback(
      (shouldUse: boolean) => {
         setSessionShouldUseProxy(shouldUse)
         dispatch(actions.setSessionShouldUseCloudProxy(shouldUse))
      },
      [dispatch, setSessionShouldUseProxy]
   )

   useEffect(() => {
      handleSessionShouldUseCloudProxy(sessionShouldUseCloudProxy) // Only ever listen to this once in the app
   }, [dispatch, handleSessionShouldUseCloudProxy, sessionShouldUseCloudProxy])

   useEffect(() => {
      if (rtcClient) {
         configureAgoraClient()
      }
   }, [rtcClient])

   const removeStreamFromList = (
      uid: IAgoraRTCRemoteUser["uid"],
      streamList
   ) => {
      return streamList.filter((entry) => entry.uid !== uid)
   }

   const configureAgoraClient = () => {
      /**
       * The RTC sdk 4.11.0 automatically switches to proxy mode after the initial request fails
       * release notes: https://docs.agora.io/en/Video/release_web_ng?platform=Web#v4110
       * docs: https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/iagorartcclient.html#event_join_fallback_to_proxy
       */
      rtcClient.on("join-fallback-to-proxy", (proxyServer) => {
         handleSessionShouldUseCloudProxy(true)
      })
      /**
       * This emit only triggers when the RTC client join method SUCCEEDS when attempting to join a channel with proxy
       * docs: https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/iagorartcclient.html#event_is_using_cloud_proxy
       * */
      rtcClient.on("is-using-cloud-proxy", (isUsing) => {
         const isUsingProxy = Boolean(isUsing)
         if (isUsingProxy) {
            handleSessionShouldUseCloudProxy(true)
         }
         dispatch(actions.setSessionIsUsingCloudProxy(Boolean(isUsingProxy)))
      })
      rtcClient.on("user-joined", async (remoteUser) => {
         setRemoteStreams((prevRemoteStreams) => {
            let cleanedRemoteStreams = removeStreamFromList(
               remoteUser.uid,
               prevRemoteStreams
            )
            return [...cleanedRemoteStreams, { uid: remoteUser.uid }]
         })
      })
      rtcClient.on("user-left", async (remoteUser) => {
         setRemoteStreams((prevRemoteStreams) => {
            return removeStreamFromList(remoteUser.uid, prevRemoteStreams)
         })
      })

      rtcClient.on("connection-state-change", (curState, prevState, reason) => {
         dispatch(
            actions.setAgoraRtcConnectionState({ curState, prevState, reason })
         )
      })

      rtcClient.on("user-published", async (remoteUser, mediaType) => {
         return rtcClient
            .subscribe(remoteUser, mediaType)
            .then(() => {
               setRemoteStreams((prevRemoteStreams) => {
                  return prevRemoteStreams.map((user) => {
                     if (user.uid === remoteUser.uid) {
                        if (mediaType === "audio") {
                           user.audioTrack = remoteUser.audioTrack
                           user.audioMuted = false
                           try {
                              // We don't play the audiotrack for the screen share track if its being shared by the local
                              // client, else it echoes with the sound of the original media player.
                              if (user.uid !== `${streamerId}screen`) {
                                 remoteUser?.audioTrack?.play?.()
                              }
                           } catch (e) {
                              dispatch(actions.sendGeneralError(e))
                           }
                        } else if (mediaType === "video") {
                           user.videoTrack = remoteUser.videoTrack
                           user.videoMuted = false
                        }
                     }
                     return user
                  })
               })

               /**
                * To benefit from the dual streams feature (on the sender)
                * Set a stream fallback option to automatically switch remote video quality when network conditions degrade
                *
                * https://github.com/AgoraIO-Community/AgoraWebSDK-NG/blob/eb8a5b2ef2/Docs/en/stream_fallback.md
                */
               rtcClient
                  .setStreamFallbackOption(remoteUser.uid, 1) // 1 - fallback to low quality video
                  .catch((e) => {
                     console.error(
                        "Failed to set setStreamFallbackOption",
                        remoteUser,
                        e
                     )
                     errorLogAndNotify(e)
                  })
            })
            .catch(handleRtcError)
      })

      rtcClient.on("user-unpublished", async (remoteUser, mediaType) =>
         rtcClient
            .unsubscribe(remoteUser, mediaType)
            .then(() => {
               setRemoteStreams((prevRemoteStreams) => {
                  return prevRemoteStreams.map((user) => {
                     if (user.uid === remoteUser.uid) {
                        if (mediaType === "audio") {
                           user.audioTrack = null
                           user.audioMuted = true
                        } else if (mediaType === "video") {
                           user.videoTrack = null
                           user.videoMuted = true
                        }
                     }
                     return user
                  })
               })
            })
            .catch(handleRtcError)
      )

      rtcClient.on("network-quality", (networkStats) => {
         const isEqualToCurrentValue =
            JSON.stringify(networkStats) === JSON.stringify(networkQuality)

         // prevent setting unnecessary a new value to avoid re-renders
         if (!isEqualToCurrentValue) {
            setNetworkQuality(getQualityObjectReference(networkStats))
         }
      })

      // https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#event_stream_type_changed
      rtcClient.on("stream-type-changed", (uid, streamType) => {
         console.log(
            "RTC Event stream-type-changed (stream quality changed)",
            uid,
            streamType
         )
      })

      // https://api-ref.agora.io/en/voice-sdk/web/4.x/interfaces/iagorartcclient.html#event_stream_fallback
      rtcClient.on("stream-fallback", (uid, isFallbackOrRecover) => {
         console.log(
            "RTC Event stream-fallback (stream toggle between audio mode only)",
            uid,
            isFallbackOrRecover
         )
      })
   }

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
   )

   return useMemo(
      () => ({ remoteStreams, networkQuality, demoStreamHandlers }),
      [remoteStreams, networkQuality, demoStreamHandlers]
   )
}

/**
 * Map that holds pointers to objects
 * By re-using the same object instance, we avoid re-renders
 *
 * The network quality event is always firing and the values switch a lot between 0 and 1
 * 0 => unknown
 * 1 => excellent
 */
const mapQualityObjectReferences = {}

const getQualityObjectReference = (currentReport) => {
   const key = `${currentReport.downlinkNetworkQuality} - ${currentReport.uplinkNetworkQuality}`

   if (mapQualityObjectReferences[key]) {
      return mapQualityObjectReferences[key]
   } else {
      mapQualityObjectReferences[key] = currentReport
      return currentReport
   }
}
