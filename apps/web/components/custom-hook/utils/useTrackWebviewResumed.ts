import { MESSAGING_TYPE } from "@careerfairy/shared-lib/messaging"
import { useEffect, useState } from "react"
import { MobileUtils } from "../../../util/mobile.utils"

/**
 * A React hook that tracks when a WebView resumes from background state.
 * When running inside a React Native WebView, this hook will:
 * 1. Listen for WEBVIEW_RESUMED messages from the mobile app
 * 2. Increment a counter each time the WebView resumes
 *
 * This is useful for handling reconnection logic when a WebView becomes active again,
 * particularly for real-time features like video streaming that may need to reconnect.
 * Only active when running in a WebView environment.
 */
export const useTrackWebviewResumedCount = () => {
   const [webviewResumedCount, setWebviewResumedCount] = useState(0)

   useEffect(() => {
      if (!MobileUtils.webViewPresence()) return

      const handleWebViewMessage = (event: MessageEvent) => {
         alert(
            "🚀 [WebApp] Received WebView message: " +
               JSON.stringify({
                  data: event.data,
                  rawEvent: event,
               })
         )

         const message = JSON.parse(event.data)
         alert("🚀 [WebApp] Parsed message: " + JSON.stringify(message))
         alert("🚀 [WebApp] Message type: " + message?.type)

         if (message.type === MESSAGING_TYPE.WEBVIEW_RESUMED) {
            alert("🚀 [WebApp] WebView resumed - incrementing counter")
            setWebviewResumedCount((prev) => prev + 1)
         }
      }

      window.addEventListener("message", handleWebViewMessage, true)
      return () => {
         window.removeEventListener("message", handleWebViewMessage, true)
      }
   }, [])

   return webviewResumedCount
}
