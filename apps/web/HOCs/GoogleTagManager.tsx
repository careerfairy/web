import { useAuth } from "./AuthProvider"
import { useCallback, useEffect, useState } from "react"
import TagManager from "react-gtm-module"
import { useSelector } from "react-redux"
import { firebaseAuthIsLoadedSelector } from "../store/selectors/firebaseSelector"
import { isTestEnvironment } from "../util/CommonUtil"

const tagManagerArgs = {
   gtmId: "GTM-P29VCWC",
}

const GoogleTagManagerLoader = ({ children }) => {
   const { userData, isLoggedIn, isLoggedOut } = useAuth()
   const [shouldLoadForCurrentUser, setShouldLoadForCurrentUser] =
      useState(false)
   const authIsLoaded = useSelector(firebaseAuthIsLoadedSelector)

   // only set it once to avoid calling TagManager.initialize multiple times
   const enableOnce = useCallback(() => {
      if (!shouldLoadForCurrentUser) {
         setShouldLoadForCurrentUser(true)
      }
   }, [shouldLoadForCurrentUser])

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

      // we don't want to record our team events (it will skew the analytics)
      if (userData?.isAdmin) return

      // userData loaded & is not an admin
      enableOnce()
   }, [userData, isLoggedIn, enableOnce])

   useEffect(() => {
      if (shouldLoadForCurrentUser) {
         TagManager.initialize(tagManagerArgs)
      }
   }, [shouldLoadForCurrentUser])

   return children
}

const GoogleTagManager = ({ children }) => {
   if (isTestEnvironment()) {
      return children
   } else {
      return <GoogleTagManagerLoader>{children}</GoogleTagManagerLoader>
   }
}

export default GoogleTagManager
