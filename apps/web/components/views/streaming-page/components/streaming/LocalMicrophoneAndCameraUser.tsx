import {
   LocalVideoTrack,
   LocalAudioTrack,
   useCurrentUID,
   ILocalVideoTrack,
   ILocalAudioTrack,
} from "agora-rtc-react"
import type { ReactNode } from "react"

import { Box, BoxProps } from "@mui/material"
import { useLocalTracks } from "../../context"
import { FloatingContent, VideoTrackWrapper } from "./VideoTrackWrapper"
import { UserCover } from "./UserCover"
import { Loader } from "./Loader"
import { styles } from "./styles"
import { userIsSpeakingSelector } from "store/selectors/streamingAppSelectors"
import { useAppSelector } from "components/custom-hook/store"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { DetailsOverlay } from "./DetailsOverlay"
import { SpeakingIndicator } from "./SpeakingIndicator"
import { useScreenShareTracks } from "../../context/ScreenShareTracks"

export type LocalMicrophoneAndCameraUserProps = {
   /**
    * Whether to play the local user's audio track. Default follows `micOn`.
    */
   readonly playAudio?: boolean
   /**
    * Whether to play the local user's video track. Default follows `cameraOn`.
    */
   readonly playVideo?: boolean
   /**
    * The volume. The value ranges from 0 (mute) to 1000 (maximum). A value of 100 is the current volume.
    */
   readonly volume?: number
   /**
    * Children is rendered on top of the video canvas.
    */
   readonly children?: ReactNode
   /**
    * Whether to contain the video inside the container or fill it.
    */
   readonly containVideo?: boolean
   /**
    * Whether to hide the details overlay.
    */
   readonly hideDetails?: boolean

   /**
    * Whether to hide the speaking indicator.
    */
   readonly hideSpeakingIndicator?: boolean

   /**
    * Whether to turn on the local user's microphone. Default false.
    */
   readonly micOn?: boolean
   /**
    * Whether to turn on the local user's camera. Default false.
    */
   readonly cameraOn?: boolean

   micMuted?: boolean
   localCameraTrack?: ILocalVideoTrack | undefined
   isLoading?: boolean
   localMicrophoneTrack?: ILocalAudioTrack | undefined
} & BoxProps

/**
 * Play/Stop local user camera and microphone track.
 */
export const LocalMicrophoneAndCameraUser = (
   props: LocalMicrophoneAndCameraUserProps
) => {
   const {
      localCameraTrack,
      localMicrophoneTrack,
      cameraOn,
      microphoneOn,
      microphoneMuted,
   } = useLocalTracks()

   return (
      <LocalUser
         {...props}
         localCameraTrack={localCameraTrack.localCameraTrack}
         isLoading={localCameraTrack.isLoading}
         localMicrophoneTrack={localMicrophoneTrack.localMicrophoneTrack}
         cameraOn={cameraOn}
         micOn={microphoneOn}
         micMuted={microphoneMuted}
      />
   )
}
export const LocalUserScreen = (props: LocalMicrophoneAndCameraUserProps) => {
   const { screenVideoTrack, screenAudioTrack } = useScreenShareTracks()
   return (
      <LocalUser
         {...props}
         localCameraTrack={screenVideoTrack}
         localMicrophoneTrack={screenAudioTrack}
         cameraOn={Boolean(screenVideoTrack)}
         micOn={Boolean(screenAudioTrack)}
         containVideo
      />
   )
}
export const LocalUser = ({
   micOn,
   micMuted,
   cameraOn,
   playAudio = false,
   playVideo,
   volume,
   hideDetails,
   hideSpeakingIndicator,
   children,
   localCameraTrack,
   localMicrophoneTrack,
   isLoading,
   ...props
}: LocalMicrophoneAndCameraUserProps) => {
   const uid = useCurrentUID()

   const isSpeaking = useAppSelector(userIsSpeakingSelector(uid))

   const { data: streamerDetails } = useStreamerDetails(uid)

   playVideo = playVideo ?? Boolean(cameraOn)
   playAudio = playAudio ?? Boolean(micOn)

   const micActive = micOn && !micMuted

   return (
      <VideoTrackWrapper {...props}>
         <Box
            sx={[styles.videoTrack, props.containVideo && styles.videoContain]}
            component={LocalVideoTrack}
            disabled={!cameraOn}
            play={playVideo}
            track={localCameraTrack}
         />
         <LocalAudioTrack
            disabled={!micOn}
            muted={micMuted}
            play={playAudio}
            track={localMicrophoneTrack}
            volume={volume}
         />
         {Boolean(isLoading) && <Loader />}
         {!playVideo ? <UserCover streamerDetails={streamerDetails} /> : null}
         {hideSpeakingIndicator ? null : (
            <SpeakingIndicator isSpeaking={Boolean(isSpeaking && micActive)} />
         )}

         <FloatingContent>{children}</FloatingContent>
         {hideDetails ? null : (
            <DetailsOverlay
               micActive={micActive}
               streamerDetails={streamerDetails}
            />
         )}
      </VideoTrackWrapper>
   )
}
