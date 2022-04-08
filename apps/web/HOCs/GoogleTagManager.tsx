import { useAuth } from "./AuthProvider"
import { useEffect } from "react"
import { getCookieConsentValue } from "react-cookie-consent"
import TagManager from "react-gtm-module"

const tagManagerArgs = {
   gtmId: "GTM-P29VCWC",
}

const GoogleTagManager = ({ disableCookies, children }) => {
   const { userData, isLoggedOut } = useAuth()

   const cookieValue = getCookieConsentValue()

   useEffect(() => {
      // should be loading the userData
      if (!isLoggedOut && userData === undefined) return

      // we don't want to record our team events (it will skew the analytics)
      if (!isLoggedOut && userData?.isAdmin) return

      if (Boolean(cookieValue === "true" && !disableCookies)) {
         TagManager.initialize(tagManagerArgs)
      }
   }, [cookieValue, disableCookies, userData, isLoggedOut])

   return children
}

export default GoogleTagManager
