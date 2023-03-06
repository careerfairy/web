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

   const { handleRtcError } = useAgoraError()

   const dispatch = useDispatch()

   const configureAgoraClient = useCallback(
      (rtcClient: IAgoraRTCClient, streamerId: UID) => {
         /**
          * Occurs when the SDK automatically switches to TCP/TLS 443.
          * This fires when the RTC is using the proxy mode (when automatically or manually enabled)
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_is_using_cloud_proxy
          */
         rtcClient.on("is-using-cloud-proxy", (isUsing) => {
            logRTCEvent("is-using-cloud-proxy", isUsing)

            dispatch(actions.setSessionIsUsingCloudProxy(true))
         })

         /**
          * Occurs when the SDK automatically switches to TCP/TLS 443.
          * This is not firing when the RTC automatically enables the proxy mode
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_join_fallback_to_proxy
          */
         rtcClient.on("join-fallback-to-proxy", (proxyServer) => {
            logRTCEvent("join-fallback-to-proxy", proxyServer)

            // sets the UI proxy indicator
            dispatch(actions.setSessionIsUsingCloudProxy(true))
         })

         /**
          * Occurs when a remote user or host joins the channel.
          *
          * In a live-broadcast channel, this callback indicates that a host joins the channel.
          * In a communication channel, this callback indicates that another user joins the channel and reports the ID of that user.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_user_joined
          */
         rtcClient.on("user-joined", async (remoteUser) => {
            setRemoteStreams((prevRemoteStreams) => {
               let cleanedRemoteStreams = removeStreamFromList(
                  remoteUser.uid,
                  prevRemoteStreams
               )
               return [...cleanedRemoteStreams, { uid: remoteUser.uid }]
            })
         })

         /**
          * Occurs when a remote user becomes offline.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_user_left
          */
         rtcClient.on("user-left", async (remoteUser) => {
            setRemoteStreams((prevRemoteStreams) => {
               return removeStreamFromList(remoteUser.uid, prevRemoteStreams)
            })
         })

         /**
          * Occurs when the state of the connection between the SDK and
          * the server changes.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_connection_state_change
          */
         rtcClient.on(
            "connection-state-change",
            (curState, prevState, reason) => {
               logRTCEvent("connection-state-change", {
                  curState,
                  prevState,
                  reason,
               })
               dispatch(
                  actions.setAgoraRtcConnectionState({
                     curState,
                     prevState,
                     reason,
                  })
               )
            }
         )

         /**
          * Occurs when a remote user publishes an audio or video track.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_user_published
          */
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

         /**
          * Occurs when a remote user unpublishes an audio or video track.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_user_unpublished
          */
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

         /**
          * Reports the network quality of the local user.
          *
          * After the local user joins the channel, the SDK triggers this callback to
          * report the uplink and downlink network conditions of the local user once every two second.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_network_quality
          */
         rtcClient.on("network-quality", (networkStats) => {
            const isEqualToCurrentValue =
               JSON.stringify(networkStats) === JSON.stringify(networkQuality)

            // prevent setting unnecessary a new value to avoid re-renders
            if (!isEqualToCurrentValue) {
               setNetworkQuality(getQualityObjectReference(networkStats))
            }
         })

         /**
          * Occurs when the type of a remote video stream changes.
          *
          * The SDK triggers this callback when a high-quality video stream
          * changes to a low-quality video stream, or vice versa.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_stream_type_changed
          */
         rtcClient.on("stream-type-changed", (uid, streamType) => {
            logRTCEvent("stream-type-changed", { uid, streamType })
         })

         /**
          * Occurs when a remote video stream falls back to an audio stream due
          * to unreliable network conditions or switches back to video after the network conditions improve.
          *
          * https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#event_stream_fallback
          */
         rtcClient.on("stream-fallback", (uid, isFallbackOrRecover) => {
            logRTCEvent("stream-fallback", { uid, isFallbackOrRecover })
         })
      },
      [dispatch, handleRtcError, networkQuality]
   )

   useEffect(() => {
      if (rtcClient) {
         console.log(
            "here calling configureAgoraClient for ",
            rtcClient,
            streamerId
         )
         configureAgoraClient(rtcClient, streamerId)
      }
   }, [configureAgoraClient, rtcClient, streamerId])

   const removeStreamFromList = (
      uid: IAgoraRTCRemoteUser["uid"],
      streamList: IRemoteStream[]
   ) => {
      return streamList.filter((entry) => entry.uid !== uid)
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

function logRTCEvent(event: string, ...args: any[]) {
   console.log(`RTC Event: ${event}`, ...args)
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

const getQualityObjectReference = (currentReport: NetworkQuality) => {
   const key = `${currentReport.downlinkNetworkQuality} - ${currentReport.uplinkNetworkQuality}`

   if (mapQualityObjectReferences[key]) {
      return mapQualityObjectReferences[key]
   } else {
      mapQualityObjectReferences[key] = currentReport
      return currentReport
   }
}
