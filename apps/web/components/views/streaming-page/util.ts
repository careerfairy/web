import { type IAgoraRTCError, useLocalCameraTrack } from "agora-rtc-react"
import { STREAM_IDENTIFIERS } from "constants/streaming"
import { v4 as uuidv4 } from "uuid"

const randomId = uuidv4().replace(/-/g, "")

export type GetUserStreamIdOptions = {
   isRecordingWindow: boolean
   useTempId: boolean
   streamId: string
   userId?: string
   creatorId?: string
}

export const getAgoraUserId = (options: GetUserStreamIdOptions) => {
   if (options.isRecordingWindow) {
      return `${STREAM_IDENTIFIERS.RECORDING}-${randomId}-${options.streamId}` as const
   }

   if (options.creatorId) {
      return `${STREAM_IDENTIFIERS.CREATOR}-${options.creatorId}-${options.streamId}` as const
   }

   if (options.useTempId || !options.userId) {
      return getTempId(options.streamId)
   }

   return `${STREAM_IDENTIFIERS.USER}-${options.userId}-${options.streamId}` as const
}

const getTempId = (streamId: string) => {
   // first check local storage
   const key = "temp-agora-Id"
   const tempId = localStorage.getItem(key)
   if (!tempId) {
      localStorage.setItem(key, randomId)
      return `${STREAM_IDENTIFIERS.ANONYMOUS}-${randomId}-${streamId}` as const
   }
   return `${STREAM_IDENTIFIERS.ANONYMOUS}-${tempId}-${streamId}` as const
}

export const getDeviceButtonColor = (
   active: boolean,
   isLoading: boolean,
   error: Error
) => {
   if (error) return "warning"
   if (isLoading) return undefined
   return active ? "primary" : "error"
}

/**
 * Need to use this helper to infer the error type as it cannot be imported directly from "agora-rtc-react"
 * due to an agora Nextjs build error
 */
type TAgoraRTCReactError = Pick<
   ReturnType<typeof useLocalCameraTrack>,
   "error"
>["error"]

export const getRTCErrorCode = (
   error: IAgoraRTCError | TAgoraRTCReactError
): IAgoraRTCError["code"] => {
   if (!error) {
      return undefined
   }

   if ("code" in error) {
      return error.code
   } else if (typeof error.rtcError !== "string") {
      return error.rtcError.code
   }
   return undefined
}

type ErrorMessages = {
   permissionDenied: string
   notReadable: string
   unknown: string
}

export const getDeviceErrorMessage = (
   error: IAgoraRTCError | TAgoraRTCReactError,
   messages: ErrorMessages
) => {
   if (!error) return ""

   const code = getRTCErrorCode(error)

   switch (code) {
      case "PERMISSION_DENIED":
         return messages.permissionDenied
      case "NOT_READABLE":
         return messages.notReadable
      default:
         return messages.unknown
   }
}

export const getCameraErrorMessage = (
   error: IAgoraRTCError | TAgoraRTCReactError
) =>
   getDeviceErrorMessage(error, {
      permissionDenied:
         "Camera permission denied. Please enable it in your browser settings.",
      notReadable: "Camera in use by another app.",
      unknown:
         "Please check your camera connection and settings. If the issue persists, try restarting your browser or device.",
   })

export const getMicrophoneErrorMessage = (
   error: IAgoraRTCError | TAgoraRTCReactError
) =>
   getDeviceErrorMessage(error, {
      permissionDenied:
         "Microphone permission denied. Please enable it in your browser settings.",
      notReadable: "Microphone in use by another app.",
      unknown:
         "Please check your microphone connection and settings. If the issue persists, try restarting your browser or device.",
   })

// Helper to safely import the AgoraRTCReact module on the client to avoid server-side build errors
export const getAgoraRTC = async () => {
   return (await import("agora-rtc-react")).default
}

export const getStreamerDisplayName = (firstName: string, lastName: string) => {
   return [firstName, lastName].filter(Boolean).join(" ")
}
