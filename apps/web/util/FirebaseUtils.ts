import SessionStorageUtil from "./SessionStorageUtil"
import { DocumentSnapshot, QuerySnapshot } from "@firebase/firestore-types"
import firebase from "firebase"

/**
 * Patch console.error() function to listen for Firestore connectivity issues
 * https://github.com/firebase/firebase-js-sdk/issues/1674
 */
if (typeof window !== "undefined") {
   const originalFn = console["error"]
   console["error"] = function (...args) {
      if (args.length === 2) {
         if (
            typeof arguments[0] === "string" &&
            arguments[0].indexOf("@firebase/firestore") !== -1 &&
            typeof arguments[1] === "string" &&
            arguments[1].indexOf(
               "Could not reach Cloud Firestore backend. Backend didn't respond within "
            ) !== -1
         ) {
            try {
               if (!SessionStorageUtil.getIsLongPollingMode()) {
                  console.warn(
                     "Activating long polling mode, received the following error from firestore:",
                     args
                  )
                  SessionStorageUtil.setIsLongPollingMode(true)
                  alert(
                     "Your network seems to be behind a proxy, we'll enable the site compatibility mode."
                  )
                  window.location.reload()
               }
            } catch (e) {
               console.error(e)
            }
         }
      }

      return originalFn.apply(console, args)
   }
}
