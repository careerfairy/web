export enum MESSAGING_TYPE {
   /**
    * ------------------------------------------------------------
    * Messages from webview to mobile app
    * ------------------------------------------------------------
    */

   "USER_AUTH" = "USER_AUTH",
   "HAPTIC" = "HAPTIC",
   "PERMISSIONS" = "PERMISSIONS",
   "LOGOUT" = "LOGOUT",
   "CONSOLE" = "CONSOLE",
   "TRACK_EVENT" = "TRACK_EVENT",
   "TRACK_SCREEN" = "TRACK_SCREEN",
   "CLEAR_CUSTOMER" = "CLEAR_CUSTOMER",
   "IDENTIFY_CUSTOMER" = "IDENTIFY_CUSTOMER",

   /**
    * ------------------------------------------------------------
    * Messages from mobile app to webview
    * ------------------------------------------------------------
    */

   /**
    * When you return to the app from the background
    */
   "WEBVIEW_RESUMED" = "WEBVIEW_RESUMED",
   "LOGOUT_WEB_VIEW" = "LOGOUT_WEB_VIEW",
}

export type USER_AUTH = {
   token: string
   userId: string
   userPassword: string
}

export type HAPTIC = {
   effect: string
   strength: number
}

export type PERMISSIONS = {
   permissions: string[]
}

export type CONSOLE = {
   type: "log" | "warn" | "error" | "debug" | "info"
   args: string[]
}

export type TRACK_EVENT = {
   eventName: string
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   properties: Record<string, any>
}

export type TRACK_SCREEN = {
   screenName: string
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   properties: Record<string, any>
}

export type IDENTIFY_CUSTOMER = {
   userAuthId: string
}

export type NativeEventStringified = { nativeEvent: { data: string } }

export type NativeEvent =
   | { type: MESSAGING_TYPE.USER_AUTH; data: USER_AUTH }
   | { type: MESSAGING_TYPE.HAPTIC; data: HAPTIC }
   | { type: MESSAGING_TYPE.PERMISSIONS; data: PERMISSIONS }
   | { type: MESSAGING_TYPE.CONSOLE; data: CONSOLE }
   | { type: MESSAGING_TYPE.LOGOUT; data: null }
   | { type: MESSAGING_TYPE.TRACK_EVENT; data: TRACK_EVENT }
   | { type: MESSAGING_TYPE.TRACK_SCREEN; data: TRACK_SCREEN }
   | { type: MESSAGING_TYPE.CLEAR_CUSTOMER; data: null }
   | { type: MESSAGING_TYPE.IDENTIFY_CUSTOMER; data: IDENTIFY_CUSTOMER }

export type WebEvent =
   | { type: MESSAGING_TYPE.LOGOUT_WEB_VIEW; data: null }
   | { type: MESSAGING_TYPE.WEBVIEW_RESUMED; data: null }
