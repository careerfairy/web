export enum MESSAGING_TYPE {
   "USER_AUTH" = "USER_AUTH",
   "HAPTIC" = "HAPTIC",
   "PERMISSIONS" = "PERMISSIONS",
   "LOGOUT" = "LOGOUT",
   /**
    * We you return to the app from the background
    */
   "WEBVIEW_RESUMED" = "WEBVIEW_RESUMED",
   "CONSOLE" = "CONSOLE",
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

export type NativeEventStringified = { nativeEvent: { data: string } }

export type NativeEvent =
   | { type: MESSAGING_TYPE.USER_AUTH; data: USER_AUTH }
   | { type: MESSAGING_TYPE.HAPTIC; data: HAPTIC }
   | { type: MESSAGING_TYPE.PERMISSIONS; data: PERMISSIONS }
   | { type: MESSAGING_TYPE.CONSOLE; data: CONSOLE }
   | { type: MESSAGING_TYPE.WEBVIEW_RESUMED; data: null }
   | { type: MESSAGING_TYPE.LOGOUT; data: null }
