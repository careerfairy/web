import {
   LocalVideoTrack,
   LocalAudioTrack,
   useCurrentUID,
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
} & BoxProps

/**
 * Play/Stop local user camera and microphone track.
 */
export const LocalMicrophoneAndCameraUser = ({
   playAudio = false,
   playVideo,
   volume,
   hideDetails,
   hideSpeakingIndicator,
   children,
   ...props
}: LocalMicrophoneAndCameraUserProps) => {
   const uid = useCurrentUID()

   const isSpeaking = useAppSelector(userIsSpeakingSelector(uid))

   const { data: streamerDetails } = useStreamerDetails(uid)

   const {
      localCameraTrack: { localCameraTrack, isLoading },
      localMicrophoneTrack: { localMicrophoneTrack },
      cameraOn,
      microphoneOn: micOn,
      microphoneMuted: micMuted,
   } = useLocalTracks()

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
