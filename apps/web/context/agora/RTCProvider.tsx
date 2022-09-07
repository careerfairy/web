import React, {
   useCallback,
   useContext,
   useEffect,
   useReducer,
   useRef,
   useState,
} from "react"
import { RtcProvider } from "./RTCContext"
import PropsContext, {
   CallbacksInterface,
   layout,
   mediaStore,
   RtcPropsInterface,
   UIKitUser,
} from "./PropsContext"
import { UID } from "agora-rtc-sdk-ng"
import TracksContext from "./TracksContext"
import { agoraServiceInstance } from "../../data/agora/AgoraService"
import { useRouter } from "next/router"

import useStreamRef from "../../components/custom-hook/useStreamRef"

import { useFirebaseService } from "../firebase/FirebaseServiceContext"
import reducer, { initState } from "./Reducer"

const useClient = agoraServiceInstance.createClient({
   mode: "live",
   codec: "vp8",
}) // pass in another client if you use h264

const RtcConfigure: React.FC<Partial<RtcPropsInterface>> = ({
   callActive,
   children,
}) => {
   const uid = useRef<UID>()
   const { fetchAgoraRtcToken } = useFirebaseService()
   const router = useRouter()
   const { path } = useStreamRef()

   const { localVideoTrack, localAudioTrack } = useContext(TracksContext)
   const { callbacks, rtcProps } = useContext(PropsContext)
   const [ready, setReady] = useState<boolean>(false)
   const [channelJoined, setChannelJoined] = useState<boolean>(false)
   const [uidState, dispatch] = useReducer<React.Reducer<stateType, any>>(
      reducer,
      initState
   )
   console.log("-> uidState", uidState)
   let joinRes: ((arg0: boolean) => void) | null = null // Resolve for canJoin -> to set canJoin to true
   const canJoin = useRef(
      new Promise<boolean | void>((resolve, reject) => {
         joinRes = resolve
         console.log(reject)
      })
   )

   let client = useClient()
   if (rtcProps.customRtcClient) {
      // if customRtcClient prop is set then use custom client
      client.removeAllListeners()
      client = rtcProps.customRtcClient
   }

   let localVideoTrackHasPublished = false
   let localAudioTrackHasPublished = false

   const mediaStore = useRef<mediaStore>({})
   console.log("-> mediaStore", mediaStore)

   if (callActive === undefined) {
      callActive = true
   }

   // init rtcEngine
   useEffect(() => {
      async function init() {
         try {
            console.log(client)
            client.on("user-joined", async (...args) => {
               const [remoteUser] = args
               mediaStore.current[remoteUser.uid] = {}
               dispatch({
                  type: "user-joined",
                  value: args,
               })
            })

            client.on("user-published", async (...args) => {
               // Get current peer IDs
               const [remoteUser, mediaType] = args
               console.log("user-published", remoteUser.uid)
               client
                  .subscribe(remoteUser, mediaType)
                  .then((_e) => {
                     // console.log('subscribe', e)
                     mediaStore.current[remoteUser.uid][mediaType + "Track"] =
                        remoteUser[mediaType + "Track"]
                     if (mediaType === "audio") {
                        // eslint-disable-next-line no-unused-expressions
                        remoteUser.audioTrack?.play()
                     } else {
                        if (
                           rtcProps.enableDualStream &&
                           rtcProps.dualStreamMode
                        ) {
                           client.setStreamFallbackOption(
                              remoteUser.uid,
                              rtcProps.dualStreamMode
                           )
                        }
                     }
                     dispatch({
                        type: "user-published",
                        value: args,
                     })
                  })
                  .catch((e) => console.log(e))
               // }
            })

            client.on("user-unpublished", async (...args) => {
               const [remoteUser, mediaType] = args
               console.log("user-unpublished", remoteUser.uid)
               if (mediaType === "audio") {
                  // eslint-disable-next-line no-unused-expressions
                  remoteUser.audioTrack?.stop()
               }
               dispatch({
                  type: "user-unpublished",
                  value: args,
               })
            })

            client.on("connection-state-change", async (...args) => {
               const [curState, prevState, reason] = args
               console.log("connection", prevState, curState, reason)
               if (curState === "CONNECTED") {
                  setChannelJoined(true)
               } else if (curState === "DISCONNECTED") {
                  dispatch({ type: "leave-channel", value: null })
               } else {
                  setChannelJoined(false)
               }
            })

            client.on("user-left", (...args) => {
               dispatch({
                  type: "user-left",
                  value: args,
               })
            })

            client.on("token-privilege-will-expire", async () => {
               console.log("token will expire")
               const token = await getToken(rtcProps)
               await client.renewToken(token)
            })

            client.on("token-privilege-did-expire", async () => {
               const token = await getToken(rtcProps)
               await client.renewToken(token)
            })

            if (callbacks) {
               const events: [keyof CallbacksInterface] = Object.keys(
                  callbacks
               ) as any
               // !!!! fix type, validate event
               events.map((e) => {
                  try {
                     client.on(e, (...args: any[]) => {
                        ;(callbacks[e] as Function).apply(null, args)
                     })
                  } catch (e) {
                     console.log(e)
                  }
               })
            }
            ;(joinRes as (arg0: boolean) => void)(true)
            setReady(true)
         } catch (e) {
            console.log(e)
         }
      }

      if (joinRes) {
         init()
         return () => {
            try {
               client.removeAllListeners()
            } catch (e) {
               console.log(e)
            }
         }
      } else return () => {}
   }, [rtcProps.appId]) //, ready])

   const getToken = useCallback(
      async (rtcPropsArg: RtcPropsInterface) => {
         const cfToken = router.query.token || ""
         const { data } = await fetchAgoraRtcToken({
            isStreamer: rtcPropsArg.isAHandRaiser
               ? false
               : rtcPropsArg.isStreamer,
            uid: rtcPropsArg.uid,
            sentToken: cfToken.toString(),
            channelName: rtcPropsArg.channel,
            streamDocumentPath: path,
         })
         return data.token.rtcToken
      },
      [router.query.token, fetchAgoraRtcToken, path]
   )

   // Dynamically switches channel when channel prop changes
   useEffect(() => {
      let ignore = false

      async function join(): Promise<void> {
         await canJoin.current
         const { channel, uid: userUid, appId } = rtcProps
         if (client && !ignore) {
            if (rtcProps.role === "audience") {
               await client.setClientRole(rtcProps.role)
            } else {
               await client.setClientRole("host")
            }
            try {
               const token = await getToken(rtcProps)
               uid.current = await client.join(
                  appId,
                  channel,
                  token,
                  userUid || 0
               )
            } catch (e) {
               console.log(e)
            }

            // console.log('!uid: ', uid.current)
         } else {
            console.error("trying to join before RTC Engine was initialized")
         }
      }

      if (callActive) {
         join()
         console.log("Attempted join: ", rtcProps.channel)
      } else {
         console.log("In precall - waiting to join")
      }
      return (): void => {
         ignore = true
         if (callActive) {
            console.log("Leaving channel")
            canJoin.current = client
               .leave()
               .catch((err: unknown) => console.log(err))
         }
      }
   }, [rtcProps.channel, rtcProps.uid, callActive, rtcProps, client])

   // publish local stream
   useEffect(() => {
      async function publish() {
         if (rtcProps.enableDualStream) {
            await client.enableDualStream()
         }
         // handle publish fail if track is not enabled
         if (localAudioTrack?.enabled && channelJoined) {
            if (!localAudioTrackHasPublished) {
               await client.publish([localAudioTrack]).then(() => {
                  localAudioTrackHasPublished = true
               })
            }
         }
         if (localVideoTrack?.enabled && channelJoined) {
            if (!localVideoTrackHasPublished) {
               await client.publish([localVideoTrack]).then(() => {
                  localVideoTrackHasPublished = true
               })
            }
         }
      }

      console.log("Publish", localVideoTrack, localAudioTrack, callActive)
      if (callActive) {
         publish()
      }
   }, [
      callActive,
      localVideoTrack?.enabled,
      localAudioTrack?.enabled,
      channelJoined,
   ])

   // update local state if tracks are not null
   useEffect(() => {
      if (localVideoTrack && localAudioTrack !== null) {
         mediaStore.current[0] = {
            audioTrack: localAudioTrack,
            videoTrack: localVideoTrack,
         }
         dispatch({
            type: "update-user-video",
            value: [localAudioTrack, localVideoTrack],
         })
      }
   }, [rtcProps.channel, channelJoined])

   // renew token if token is updated
   useEffect(() => {
      if (channelJoined && rtcProps.token) {
         client
            .renewToken(rtcProps.token)
            .then((e) => console.log("renewed token", e))
      }
   }, [rtcProps.token, channelJoined])

   // set role if role is updated
   useEffect(() => {
      if (rtcProps.role) {
         client
            .setClientRole(rtcProps.role)
            .then((e) => console.log("changed role", e))
      }
   }, [rtcProps.role, channelJoined])

   // active speaker
   useEffect(() => {
      async function enableActiveSpeaker() {
         if (rtcProps.activeSpeaker && rtcProps.layout !== layout.grid) {
            client.on("volume-indicator", (volumes) => {
               const highestvolumeObj = volumes.reduce(
                  (
                     highestVolume: {
                        level: number
                        uid: UID
                     },
                     volume
                  ) => {
                     if (highestVolume === null) {
                        return volume
                     } else {
                        if (volume.level > highestVolume.level) {
                           return volume
                        }
                        return highestVolume
                     }
                  },
                  null
               )
               const activeSpeaker = highestvolumeObj
                  ? highestvolumeObj.uid
                  : undefined
               const mapActiveSpeakerToZero =
                  activeSpeaker === uid.current ? 0 : activeSpeaker
               if (activeSpeaker !== undefined) {
                  dispatch({
                     type: "ActiveSpeaker",
                     value: [mapActiveSpeakerToZero],
                  })
               }
            })
            await client.enableAudioVolumeIndicator()
         }
      }

      if (callActive) {
         enableActiveSpeaker().then((r) => console.log(r))
      }
      return () => {
         client.removeAllListeners("volume-indicator")
      }
   }, [rtcProps.activeSpeaker, rtcProps.layout])

   return (
      <RtcProvider
         value={{
            client,
            mediaStore: mediaStore.current,
            localVideoTrack,
            localAudioTrack,
            dispatch,
            localUid: uid,
            channelJoined,
         }}
      >
         {ready ? children : null}
      </RtcProvider>
   )
}

/**
 * React component that contains the RTC logic. It manages the user state and provides it the children components by wrapping them with context providers.
 */
type stateType = { max: UIKitUser[]; min: UIKitUser[] }

export default RtcConfigure
