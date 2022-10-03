import { parseCookies, setCookie } from "nookies"

export default class CookiesUtil {
   static setUTMParams = (value: object) => {
      return setCookie(null, "utm_params", JSON.stringify(value), {
         maxAge: 3 * 24 * 60 * 60, // 3 days, same as Google Analytics
         path: "/", // make it available to all pages
      })
   }

   static getUTMParams = () => {
      const existing = parseCookies(null)["utm_params"]
      return existing ? JSON.parse(existing) : null
   }
}
