export const firebaseConfig = {
   apiKey: "AIzaSyAMx1wVVxqo4fooh0OMVSeSTOqNKzMbch0",
   authDomain: "careerfairy-e1fd9.firebaseapp.com",
   databaseURL: "https://careerfairy-e1fd9.firebaseio.com",
   projectId: "careerfairy-e1fd9",
   storageBucket: "careerfairy-e1fd9.appspot.com",
   messagingSenderId: "993933306494",
   appId: "1:993933306494:web:8c51e7a31d29ea9143862f",
}

export enum MESSAGING_TYPE {
   "USER_AUTH" = "USER_AUTH",
   "HAPTIC" = "HAPTIC",
   "PERMISSIONS" = "PERMISSIONS",
   "LOGOUT" = "LOGOUT",
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

export type NativeEventStringified = { nativeEvent: { data: string } }
export type NativeEvent = {
   type: MESSAGING_TYPE
   data: USER_AUTH | HAPTIC | PERMISSIONS
}
