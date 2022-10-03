import {
   localStorageInvite,
   localStorageReferralCode,
} from "../constants/localStorageKeys"

export default class LocalStorageUtil {
   static getInviteLivestream = () => {
      return localStorage?.getItem(localStorageInvite)
   }

   static getReferralCode = () => {
      return localStorage?.getItem(localStorageReferralCode)
   }

   static setInviteLivestream = (livestreamId) => {
      return localStorage?.setItem(localStorageInvite, livestreamId)
   }

   static setReferralCode = (referralCode) => {
      return localStorage?.setItem(localStorageReferralCode, referralCode)
   }
}
