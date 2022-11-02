import {
   localStorageInvite,
   localStorageReferralCode,
} from "../constants/localStorageKeys"

export default class LocalStorageUtil {
   static getInviteLivestream = () => {
      return LocalStorageUtil.get(localStorageInvite)
   }

   static getReferralCode = () => {
      return LocalStorageUtil.get(localStorageReferralCode)
   }

   static setInviteLivestream = (livestreamId) => {
      return LocalStorageUtil.set(localStorageInvite, livestreamId)
   }

   static setReferralCode = (referralCode) => {
      return LocalStorageUtil.set(localStorageReferralCode, referralCode)
   }

   static get(key: string) {
      try {
         return localStorage?.getItem(key)
      } catch (e) {
         /**
          * Catch browser permission errors
          * SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
          */
         console.error(e)
         return undefined
      }
   }

   static set(key: string, value: any) {
      try {
         return localStorage?.setItem(key, value)
      } catch (e) {
         /**
          * Catch browser permission errors
          * SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
          */
         console.error(e)
      }
   }
}
