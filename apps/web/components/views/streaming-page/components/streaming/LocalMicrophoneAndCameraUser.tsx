import { LocalVideoTrack, LocalAudioTrack } from "agora-rtc-react"
import type { ReactNode } from "react"

import { Box, BoxProps, CircularProgress } from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { CenteredContainer } from "./CenteredContainer"

const styles = sxStyles({
   root: {
      position: "relative",
      borderRadius: 2,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   videoTrack: {
      "& > div": {
         backgroundColor: (theme) => theme.brand.white[500] + " !important",
         overflow: "hidden",
      },
   },
   videoContain: {
      "& .agora_video_player": {
         objectFit: "contain !important",
      },
   },
   childrenWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
   loaderWrapper: {
      bgcolor: (theme) => theme.brand.black[800],
   },
   loader: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
})

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
} & BoxProps

/**
 * Play/Stop local user camera and microphone track.
 */
export const LocalMicrophoneAndCameraUser = ({
   playAudio = false,
   playVideo,
   volume,
   children,
   ...props
}: LocalMicrophoneAndCameraUserProps) => {
   const {
      localCameraTrack: { localCameraTrack, isLoading },
      localMicrophoneTrack: { localMicrophoneTrack },
      cameraOn,
      microphoneOn: micOn,
      microphoneMuted: micMuted,
   } = useLocalTracks()

   playVideo = playVideo ?? Boolean(cameraOn)
   playAudio = playAudio ?? Boolean(micOn)

   return (
      <Box {...props} sx={combineStyles(styles.root, props.sx)}>
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
         {Boolean(isLoading) && (
            <CenteredContainer sx={styles.loaderWrapper}>
               <CircularProgress size={50} />
            </CenteredContainer>
         )}
         <Box sx={styles.childrenWrapper}>{children}</Box>
      </Box>
   )
}
