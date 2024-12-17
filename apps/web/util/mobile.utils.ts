import { MESSAGING_TYPE } from "@careerfairy/shared-lib/messaging"

export class MobileUtils {
   public static send<T>(type: MESSAGING_TYPE, data: T): void {
      if (this.webViewPresence()) {
         const body: { type: MESSAGING_TYPE; data: T } = { type, data }
         const mobileWindow: any = window as any
         mobileWindow.ReactNativeWebView.postMessage(JSON.stringify(body))
      }
   }

   public static webViewPresence(): boolean {
      const webViewWindow: any = (typeof window !== "undefined") ? window as any : null
      return !(
         !webViewWindow?.ReactNativeWebView ||
         typeof webViewWindow?.ReactNativeWebView?.postMessage !== "function"
      )
   }
}
