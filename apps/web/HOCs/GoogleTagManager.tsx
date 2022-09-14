import { useAuth } from "./AuthProvider"
import { useEffect } from "react"
import TagManager from "react-gtm-module"

const tagManagerArgs = {
   gtmId: "GTM-P29VCWC",
}

const GoogleTagManagerLoader = ({ disableCookies, children }) => {
   const { userData, isLoggedIn } = useAuth()

   useEffect(() => {
      // should be loading the userData
      if (!isLoggedIn && userData === undefined) return

      // we don't want to record our team events (it will skew the analytics)
      if (!isLoggedIn && userData?.isAdmin) return

      if (!disableCookies) {
         TagManager.initialize(tagManagerArgs)
      }
   }, [disableCookies, userData, isLoggedIn])

   return children
}

const GoogleTagManager = ({ disableCookies, children }) => {
   if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
      return children
   } else {
      return (
         <GoogleTagManagerLoader disableCookies={disableCookies}>
            {children}
         </GoogleTagManagerLoader>
      )
   }
}

export default GoogleTagManager
