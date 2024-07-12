import { useEffect, useState, type ReactNode } from "react"

import { Box, BoxProps } from "@mui/material"
import {
   RemoteAudioTrack,
   useAutoPlayVideoTrack,
   useRemoteUserTrack,
} from "agora-rtc-react"
import { useAppDispatch, useAppSelector } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { setAutoplayState } from "store/reducers/streamingAppReducer"
import {
   useAutoplayState,
   userIsSpeakingSelector,
} from "store/selectors/streamingAppSelectors"
import { useUserStream } from "../../context/UserStream"
import { RemoteUser } from "../../types"
import { DetailsOverlay } from "./DetailsOverlay"
import { LinearGradient } from "./LinearGradient"
import { Loader } from "./Loader"
import { SpeakingIndicator } from "./SpeakingIndicator"
import { UserCover } from "./UserCover"
import { FloatingContent, VideoTrackWrapper } from "./VideoTrackWrapper"
import { styles } from "./styles"

type Props = {
   /**
    * `true`: Play the video track of the remote user.`false`: Stop playing the video track of the remote user.
    */
   readonly playVideo?: boolean

   /**
    * `true`: Play the audio track of the remote user.`false`: Stop playing the audio track of the remote user.
    */
   readonly playAudio?: boolean

   /**
    * The ID of the playback device, such as a speaker. The device ID can be obtained using [`IAgoraRTC.getPlaybackDevices`](https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartc.html#getplaybackdevices). This property is only supported in the desktop version of the Chrome browser. Modifying the value of this property in other browsers throws a `NOT_SUPPORTED` error.
    * Defaults to default speakers
    */
   readonly playbackDeviceId?: string

   /**
    * The volume. The value ranges from 0 (mute) to 100 (the original volume).
    */
   readonly volume?: number
   /**
    * The React nodes to be rendered.
    */
   readonly children?: ReactNode
} & BoxProps

export const RemoteStreamer = ({
   playVideo,
   playAudio,
   playbackDeviceId,
   volume,
   children,
   ...props
}: Props) => {
   const { user, type } = useUserStream<RemoteUser>()
   const dispatch = useAppDispatch()
   const [videoTrackDiv, setVideoTrackDiv] = useState<HTMLDivElement | null>(
      null
   )

   const isSpeaking = useAppSelector(userIsSpeakingSelector(user.uid))
   const streamIsMobile = useStreamIsMobile()

   const { data: streamerDetails } = useStreamerDetails(user.uid)

   const { track: videoTrack, isLoading: videoIsLoading } = useRemoteUserTrack(
      user,
      "video"
   )
   const { track: audioTrack, isLoading: audioIsLoading } = useRemoteUserTrack(
      user,
      "audio"
   )

   const autoplayState = useAutoplayState()
   const shouldPlayAgain = autoplayState === "should-play-again"

   useEffect(() => {
      if (shouldPlayAgain) {
         audioTrack?.play()
         videoTrack?.play(videoTrackDiv)
         dispatch(setAutoplayState("playing"))
      }
   }, [shouldPlayAgain, audioTrack, dispatch, videoTrack, videoTrackDiv])

   const isScreenShare = type === "remote-user-screen"

   const isLoading = videoIsLoading || audioIsLoading

   playVideo = playVideo ?? user?.hasVideo
   playAudio = playAudio ?? user?.hasAudio

   useAutoPlayVideoTrack(videoTrack, playVideo, videoTrackDiv)

   return (
      <VideoTrackWrapper {...props}>
         <Box
            sx={[styles.videoTrack, isScreenShare && styles.videoContain]}
            ref={setVideoTrackDiv}
            className="videoTrack"
         />
         <RemoteAudioTrack
            play={playAudio}
            playbackDeviceId={playbackDeviceId}
            track={audioTrack}
            volume={volume}
         />
         {Boolean(isLoading) && <Loader />}
         {isScreenShare ? null : <LinearGradient />}
         {!playVideo ? <UserCover streamerDetails={streamerDetails} /> : null}
         <SpeakingIndicator isSpeaking={isSpeaking} />
         <FloatingContent>{children}</FloatingContent>
         {streamIsMobile ? null : (
            <DetailsOverlay
               micActive={user.hasAudio}
               streamerDetails={streamerDetails}
               showIcons={!isScreenShare}
            />
         )}
      </VideoTrackWrapper>
   )
}
