import { AgoraRTCReactError, IAgoraRTCError } from "agora-rtc-react"
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

export const getRTCErrorCode = (
   error: IAgoraRTCError | AgoraRTCReactError
): IAgoraRTCError["code"] => {
   if (!error) {
      return undefined
   }

   if (
      error instanceof AgoraRTCReactError &&
      typeof error.rtcError !== "string"
   ) {
      return error.rtcError.code
   } else if ("code" in error) {
      return error.code
   }
   return undefined
}

type ErrorMessages = {
   permissionDenied: string
   notReadable: string
   unknown: string
}

export const getDeviceErrorMessage = (
   error: IAgoraRTCError | AgoraRTCReactError,
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
