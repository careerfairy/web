import { MESSAGING_TYPE, WebEvent } from "@careerfairy/shared-lib/messaging"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useAuth } from "HOCs/AuthProvider"
import { useCallback, useEffect } from "react"
import { MobileUtils } from "../../../util/mobile.utils"

/**
 * React hook that listens for messages from a React Native WebView.
 * Handles WebView logout events when running in mobile environment.
 */
export const useSubscribeToWebviewMessages = () => {
   const firebaseService = useFirebaseService()
   const { isLoggedOut } = useAuth()

   const handleLogout = useCallback(() => {
      if (isLoggedOut) return

      firebaseService.doSignOut()
   }, [firebaseService, isLoggedOut])

   useEffect(() => {
      if (!MobileUtils.webViewPresence()) return

      const handleWebViewMessage = (event: MessageEvent) => {
         try {
            const message: WebEvent = JSON.parse(event.data)
            switch (message.type) {
               case MESSAGING_TYPE.LOGOUT_WEB_VIEW:
                  handleLogout()
                  break
               default:
                  break
            }
         } catch (error) {
            console.error("Error parsing webview message:", error)
         }
      }

      window.addEventListener("message", handleWebViewMessage, true)
      return () => {
         window.removeEventListener("message", handleWebViewMessage, true)
      }
   }, [handleLogout])
}
