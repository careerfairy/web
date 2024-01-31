import { type IAgoraRTCError, useLocalCameraTrack } from "agora-rtc-react"
import { v4 as uuidv4 } from "uuid"

const randomId = uuidv4().replace(/-/g, "")

export type GetUserStreamIdOptions = {
   isRecordingWindow: boolean
   useRandomId: boolean
   streamId: string
   userId?: string
}

export const getAgoraUserId = (options: GetUserStreamIdOptions) => {
   if (options.isRecordingWindow) {
      return randomId
   }

   if (options.useRandomId || !options.userId) {
      return `${options.streamId}${randomId}`
   }

   return `${options.streamId}${options.userId}`
}

export const withLocalStorage = (key: string, generateValue: () => string) => {
   let value = localStorage.getItem(key)
   if (!value) {
      value = generateValue()
      localStorage.setItem(key, value)
   }
   return value
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

// Helper to safely import the AgoraRTCReact module on the client to avoid server-side build errors
export const getAgoraRTC = async () => {
   return (await import("agora-rtc-react")).default
}
