import type { ReactNode } from "react"

import {
   RemoteAudioTrack,
   RemoteVideoTrack,
   useRemoteUserTrack,
   IAgoraRTCRemoteUser,
} from "agora-rtc-react"
import { UserCover } from "./UserCover"
import { FloatingContent, VideoTrackWrapper } from "./VideoTrackWrapper"
import { Box, BoxProps } from "@mui/material"
import { Loader } from "./Loader"
import { styles } from "./styles"
import { useAppSelector } from "components/custom-hook/store"
import { userIsSpeakingSelector } from "store/selectors/streamingAppSelectors"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { DetailsOverlay } from "./DetailsOverlay"
import { SpeakingIndicator } from "./SpeakingIndicator"

type Props = {
   /**
    * The remote user object.
    */
   readonly user: IAgoraRTCRemoteUser

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
   /**
    * Whether to contain the video inside the container or fill it.
    */
   readonly containVideo?: boolean
} & BoxProps

export const RemoteStreamer = ({
   user,
   playVideo,
   playAudio,
   playbackDeviceId,
   volume,
   children,
   ...props
}: Props) => {
   const isSpeaking = useAppSelector(userIsSpeakingSelector(user.uid))

   const { data: streamerDetails } = useStreamerDetails(user.uid)

   const { track: videoTrack, isLoading: videoIsLoading } = useRemoteUserTrack(
      user,
      "video"
   )
   const { track: audioTrack, isLoading: audioIsLoading } = useRemoteUserTrack(
      user,
      "audio"
   )

   const isLoading = videoIsLoading || audioIsLoading

   playVideo = playVideo ?? user?.hasVideo
   playAudio = playAudio ?? user?.hasAudio

   return (
      <VideoTrackWrapper {...props}>
         <Box
            component={RemoteVideoTrack}
            sx={[styles.videoTrack, props.containVideo && styles.videoContain]}
            play={playVideo}
            track={videoTrack}
         />
         <RemoteAudioTrack
            play={playAudio}
            playbackDeviceId={playbackDeviceId}
            track={audioTrack}
            volume={volume}
         />
         {Boolean(isLoading) && <Loader />}
         {!playVideo ? <UserCover streamerDetails={streamerDetails} /> : null}
         <SpeakingIndicator isSpeaking={isSpeaking} />
         <FloatingContent>{children}</FloatingContent>
         <DetailsOverlay
            micActive={user.hasAudio}
            streamerDetails={streamerDetails}
         />
      </VideoTrackWrapper>
   )
}
