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

export type NativeEventStringified = { nativeEvent: { data: string } }
export type NativeEvent = {
   type: MESSAGING_TYPE
   data: USER_AUTH | HAPTIC | PERMISSIONS
}
