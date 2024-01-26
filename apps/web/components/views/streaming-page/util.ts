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
