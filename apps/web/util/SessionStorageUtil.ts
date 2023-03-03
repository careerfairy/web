export default class SessionStorageUtil {
   static getIsLongPollingMode = () => {
      return SessionStorageUtil.get("compat_longpolling")
   }

   static setIsLongPollingMode = (value) => {
      return SessionStorageUtil.set("compat_longpolling", value)
   }

   static setReferrer = (value: string) => {
      return SessionStorageUtil.set("referrer", value)
   }

   static getReferrer = () => {
      const val = SessionStorageUtil.get("referrer")
      return val ? val : null
   }

   static get(key: string) {
      try {
         return sessionStorage?.getItem(key)
      } catch (e) {
         /**
          * Catch browser permission errors
          * SecurityError: Failed to read the 'sessionStorage' property from 'Window': Access is denied for this document.
          */
         console.error(e)
         return undefined
      }
   }

   static set(key: string, value: any) {
      try {
         return sessionStorage?.setItem(key, value)
      } catch (e) {
         /**
          * Catch browser permission errors
          * SecurityError: Failed to read the 'sessionStorage' property from 'Window': Access is denied for this document.
          */
         console.error(e)
      }
   }
}
//
