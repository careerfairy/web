export enum MESSAGING_TYPE {
   "USER_AUTH" = "USER_AUTH",
   "HAPTIC" = "HAPTIC",
   "PERMISSIONS" = "PERMISSIONS",
   "LOGOUT" = "LOGOUT",
}

export type USER_DATA = {
   id: string
   firstName: string
   lastName: string
   fieldOfStudy?: {
      id: string
      name: string
   }
   gender?: string
   university?: {
      code: string
      name: string
   }
   levelOfStudy?: {
      id: string
      name: string
   }
   authId: string
   unsubscribed: boolean
   credits?: number
   validationPin?: number
   referralCode?: string
   userEmail: string
   universityCountryCode?: string
   isStudent: boolean
   createdAt: {
      seconds: number
      nanoseconds: number
   }
   lastActivityAt: {
      seconds: number
      nanoseconds: number
   }
   timezone?: string
   linkedinUrl?: string
   isAdmin: boolean
   contentTopicsTagIds?: string[]
   businessFunctionsTagIds: string[]
   welcomeDialogComplete: boolean
   jobsBannerCTADates: string[]
   sparksBannerCTADates: string[]
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

export const isInWebView = (): boolean => {
   const webViewWindow: any = window as any
   return !(
      !webViewWindow.ReactNativeWebView ||
      typeof webViewWindow.ReactNativeWebView.postMessage !== "function"
   )
}
