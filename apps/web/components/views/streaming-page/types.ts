import {
   type IAgoraRTCRemoteUser,
   type ICameraVideoTrack,
   type ILocalAudioTrack,
   type ILocalVideoTrack,
   type IMicrophoneAudioTrack,
   type UID,
} from "agora-rtc-react"

export type LocalUser = {
   type: "local-user"
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

export type LocalUserScreen = {
   type: "local-user-screen"
   user: {
      /**
       * The unique identifier for the user's screen share.
       */
      uid: UID
      /**
       * The video track for the user's camera. It can be undefined or null if no video track is available.
       */
      videoTrack?: ILocalVideoTrack | null
      /**
       * The audio track for the user's microphone. It can be undefined or null if no audio track is available.
       */
      audioTrack?: ILocalAudioTrack | null
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
   type: "remote-user" | "remote-user-screen"
   user: IAgoraRTCRemoteUser
}

export type UserStream = LocalUser | LocalUserScreen | RemoteUser

export enum VirtualBackgroundMode {
   IMAGE = "virtual background",
   BLUR = "blur",
   OFF = "off",
}
