import {
   localStorageInvite,
   localStorageReferralCode,
} from "../constants/localStorageKeys";

export default class LocalStorageUtil {
   static getAudioInputFromLocalStorage = () => {
      return localStorage.getItem("selectedAudioInput");
   };

   static getAudioOutputFromLocalStorage = () => {
      return localStorage.getItem("selectedAudioOutput");
   };

   static getVideoInputFromLocalStorage = () => {
      return localStorage.getItem("selectedVideoInput");
   };

   static setAudioInputFromLocalStorage = (deviceId) => {
      return localStorage.setItem("selectedAudioInput", deviceId);
   };

   static setAudioOutputFromLocalStorage = (deviceId) => {
      return localStorage.setItem("selectedAudioOutput", deviceId);
   };

   static setVideoInputFromLocalStorage = (deviceId) => {
      return localStorage.setItem("selectedVideoInput", deviceId);
   };

   static setInviteLivestream = (livestreamId) => {
      return localStorage?.setItem(localStorageInvite, livestreamId);
   };

   static setReferralCode = (referralCode) => {
      return localStorage?.setItem(localStorageReferralCode, referralCode);
   };
}
