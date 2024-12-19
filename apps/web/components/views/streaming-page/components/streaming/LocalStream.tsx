import {
   LocalVideoTrack,
   LocalAudioTrack,
   ILocalVideoTrack,
   ILocalAudioTrack,
} from "agora-rtc-react"
import { type ReactNode, useEffect, useState } from "react"

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
import { useScreenShare } from "../../context/ScreenShare"
import { LocalUser, LocalUserScreen } from "../../types"
import { useUserStream } from "../../context/UserStream"
import { LinearGradient } from "./LinearGradient"
import { isSafari } from "react-device-detect"

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
   /**
    * Whether the local user's microphone is muted. Default is undefined.
    */
   readonly micMuted?: boolean
   /**
    * The local user's camera track
    */
   readonly localCameraTrack?: ILocalVideoTrack | undefined
   /**
    * Whether the component is in a loading state. Default is undefined.
    */
   readonly isLoading?: boolean
   /**
    * The local user's microphone track
    */
   readonly localMicrophoneTrack?: ILocalAudioTrack | undefined

   /**
    * Whether to contain the video within the container. Default false.
    */
   readonly containVideo?: boolean

   readonly hideGradient?: boolean
} & BoxProps

/**
 * Play/Stop local user camera and microphone track.
 */
export const LocalUserStream = (props: LocalMicrophoneAndCameraUserProps) => {
   const {
      localCameraTrack,
      localMicrophoneTrack,
      cameraOn,
      microphoneOn,
      microphoneMuted,
   } = useLocalTracks()

   return (
      <LocalStream
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

export const LocalScreenStream = () => {
   const { screenVideoTrack, screenAudioTrack, isLoadingScreenShare } =
      useScreenShare()

   return (
      <LocalStream
         localCameraTrack={screenVideoTrack}
         localMicrophoneTrack={screenAudioTrack}
         cameraOn={Boolean(screenVideoTrack)}
         micOn={Boolean(screenAudioTrack)}
         isLoading={isLoadingScreenShare}
         hideDetails
      />
   )
}

export const LocalStream = ({
   micOn,
   micMuted,
   cameraOn,
   playAudio = false,
   playVideo,
   volume,
   hideDetails,
   containVideo,
   hideSpeakingIndicator,
   children,
   localCameraTrack,
   localMicrophoneTrack,
   isLoading,
   hideGradient,
   ...props
}: LocalMicrophoneAndCameraUserProps) => {
   const { user, type } = useUserStream<LocalUser | LocalUserScreen>()
   const [forceRender, setForceRender] = useState(0)

   // If browser is Safari, we are enforcing re-render of box for it to work without adding full screen
   useEffect(() => {
      if (isSafari) {
         setForceRender((prev) => prev + 1) // Force DOM update
      }
   }, [localCameraTrack])

   const isSpeaking = useAppSelector(userIsSpeakingSelector(user.uid))

   const { data: streamerDetails } = useStreamerDetails(user.uid)

   const isScreenShare = type === "local-user-screen"

   playVideo = playVideo ?? Boolean(cameraOn)
   playAudio = playAudio ?? Boolean(micOn)

   const micActive = micOn && !micMuted

   return (
      <VideoTrackWrapper {...props}>
         <Box
            key={forceRender}
            sx={[
               styles.videoTrack,
               isScreenShare && styles.videoContain,
               containVideo && styles.videoContain,
            ]}
            className="videoTrack"
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
         {isScreenShare || hideGradient ? null : <LinearGradient />}
         {!playVideo ? <UserCover streamerDetails={streamerDetails} /> : null}
         {hideSpeakingIndicator ? null : (
            <SpeakingIndicator isSpeaking={Boolean(isSpeaking && micActive)} />
         )}

         <FloatingContent>{children}</FloatingContent>
         {hideDetails || isScreenShare ? null : (
            <DetailsOverlay
               micActive={micActive}
               streamerDetails={streamerDetails}
               showIcons={!isScreenShare}
            />
         )}
      </VideoTrackWrapper>
   )
}
