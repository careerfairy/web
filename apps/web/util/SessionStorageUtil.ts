export default class SessionStorageUtil {
   static getIsLongPollingMode = () => {
      return sessionStorage?.getItem("compat_longpolling")
   }

   static setIsLongPollingMode = (value) => {
      return sessionStorage?.setItem("compat_longpolling", value)
   }

   static setUTMParams = (value: object) => {
      return sessionStorage?.setItem("utm_params", JSON.stringify(value))
   }

   static getUTMParams = () => {
      const existing = sessionStorage?.getItem("utm_params")
      return existing ? JSON.parse(existing) : null
   }

   static setReferrer = (value: string) => {
      return sessionStorage?.setItem("referrer", value)
   }

   static getReferrer = () => {
      const val = sessionStorage?.getItem("referrer")
      return val ? val : null
   }
}
