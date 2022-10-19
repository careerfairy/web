import { useAuth } from "./AuthProvider"
import { useCallback, useEffect } from "react"
import TagManager from "react-gtm-module"
import { useSelector } from "react-redux"
import { firebaseAuthIsLoadedSelector } from "../store/selectors/firebaseSelector"
import { shouldUseEmulators } from "../util/CommonUtil"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { dataLayerUser } from "../util/analyticsUtils"

const tagManagerArgs = {
   gtmId: "GTM-P29VCWC",
}

// Module scope variable, we only want to initialize gtm once
// GA4 has enhanced measurement enabled to track all page views
let gtmLoaded = false

const GoogleTagManagerLoader = ({ children }) => {
   const { userData, isLoggedIn, isLoggedOut } = useAuth()
   const authIsLoaded = useSelector(firebaseAuthIsLoadedSelector)

   const enableOnce = useCallback((userData?: UserData) => {
      if (!gtmLoaded) {
         let userVariables = {}
         if (userData) {
            // userVariables = {
            //    dataLayer: {
            //       userId: userData.authId,
            //       isAdmin: userData.isAdmin === true,
            //    },
            // }

            dataLayerUser(userData)
         }

         TagManager.initialize({
            // ...userVariables,
            ...tagManagerArgs,
         })

         // prevent from setting this again
         gtmLoaded = true
      }
   }, [])

   // check if user isAdmin or not
   useEffect(() => {
      if (!authIsLoaded) {
         // not ready, since auth is not yet loaded
         return
      }

      if (isLoggedOut) {
         // anonymous traffic
         enableOnce()
         return
      }

      // should be loading the userData, wait
      if (!userData) return

      // Initialize GTM and send a custom event with the user info
      // some tags will not fire if the user is admin
      enableOnce(userData)
   }, [userData, isLoggedIn, enableOnce, authIsLoaded, isLoggedOut])

   return children
}

const GoogleTagManager = ({ children }) => {
   if (shouldUseEmulators()) {
      return children
   } else {
      return <GoogleTagManagerLoader>{children}</GoogleTagManagerLoader>
   }
}

export default GoogleTagManager
