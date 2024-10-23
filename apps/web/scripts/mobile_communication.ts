export enum MESSAGING_TYPE {
   "USER_AUTH" = "USER_AUTH",
   "HAPTIC" = "HAPTIC",
   "PERMISSIONS" = "PERMISSIONS",
   LOGOUT = "LOGOUT",
}

type USER_DATA = {
   id: number | string
   firstName: string
   lastName: string
   age: number
   experience: number
   skills: string[]
}

export type USER_AUTH = {
   token: string
   userData: USER_DATA
}

export type HAPTIC = {
   effect: string
   strength: number
}

export type PERMISSIONS = {
   types: string[]
}

export const mobileCommunication = <T>(type: MESSAGING_TYPE, data: T): void => {
   const body: { type: MESSAGING_TYPE; data: T } = { type, data }
   const mobileWindow: any = window as any
   if (
      !mobileWindow.ReactNativeWebView ||
      typeof mobileWindow.ReactNativeWebView.postMessage !== "function"
   ) {
      return
   }
   // Send a message to the React Native WebView
   mobileWindow.ReactNativeWebView.postMessage(JSON.stringify(body))
}
