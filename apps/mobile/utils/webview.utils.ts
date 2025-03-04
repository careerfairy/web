import { WebEvent } from "@careerfairy/shared-lib/src/messaging"
import { RefObject } from "react"
import { WebView } from "react-native-webview"

/**
 * Sends a message to the WebView
 * @param webViewRef Reference to the WebView component
 * @param message Message to be sent
 */
export const sendToWebView = (
   webViewRef: RefObject<WebView>,
   message: WebEvent
): void => {
   if (!webViewRef?.current) return

   try {
      const messageString = JSON.stringify(message)

      webViewRef.current.postMessage(messageString)
   } catch (error) {
      console.error(
         `Error sending message: ${JSON.stringify(
            message,
            null,
            2
         )} to webview: ${JSON.stringify(error, null, 2)}`
      )
   }
}
