export enum MESSAGING_TYPE {
   "USER_AUTH" = "USER_AUTH",
   "HAPTIC" = "HAPTIC",
   "PERMISSIONS" = "PERMISSIONS",
   "LOGOUT" = "LOGOUT",
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

export type NativeEventStringified = { nativeEvent: { data: string } }
export type NativeEvent = {
   type: MESSAGING_TYPE
   data: USER_AUTH | HAPTIC | PERMISSIONS
}
