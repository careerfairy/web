import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { parseCookies, setCookie } from "nookies"

type ParseJwtProps = { token?: string; isServerSide?: boolean }

export default class CookiesUtil {
   static setUTMParams = (value: UTMParams) => {
      return setCookie(null, "utm_params", JSON.stringify(value), {
         maxAge: 3 * 24 * 60 * 60, // 3 days, same as Google Analytics
         path: "/", // make it available to all pages
      })
   }

   static getUTMParams = (): UTMParams => {
      const existing = parseCookies(null)["utm_params"]
      return existing ? JSON.parse(existing) : null
   }

   static parseJwt = ({ token, isServerSide = false }: ParseJwtProps) => {
      if (!token || (!isServerSide && typeof window === "undefined"))
         return null
      let base64Url = token.split(".")[1]
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")

      const decoded64 = isServerSide
         ? Buffer.from(base64, "base64").toString()
         : window.atob(base64)

      if (isServerSide) {
         return JSON.parse(decoded64)
      }

      // TODO: confirm if this is really needed, causing errors for some server side tokens
      const jsonPayload = decodeURIComponent(
         decoded64
            .split("")
            .map(function (c) {
               return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join("")
      )

      return JSON.parse(jsonPayload)
   }
}
