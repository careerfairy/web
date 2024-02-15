import {
   type IAgoraRTCRemoteUser,
   type ICameraVideoTrack,
   type IMicrophoneAudioTrack,
   type UID,
} from "agora-rtc-react"

export type LocalUser = {
   type: "local"
   user: {
      /**
       * The unique identifier for the user.
       */
      uid: UID
      /**
       * The video track for the user's camera. It can be undefined or null if no video track is available.
       */
      videoTrack?: ICameraVideoTrack | null
      /**
       * The audio track for the user's microphone. It can be undefined or null if no audio track is available.
       */
      audioTrack?: IMicrophoneAudioTrack | null
      /**
       * Indicates whether the user has an audio track.
       */
      hasAudio: boolean
      /**
       * Indicates whether the user has a video track.
       */
      hasVideo: boolean
   }
}

export type RemoteUser = {
   type: "remote"
   user: IAgoraRTCRemoteUser
}

export type StreamUser = LocalUser | RemoteUser
