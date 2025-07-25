import { MESSAGING_TYPE } from "@careerfairy/shared-lib/messaging"

export class MobileUtils {
   public static send<T>(type: MESSAGING_TYPE, data: T): void {
      if (this.webViewPresence()) {
         const body: { type: MESSAGING_TYPE; data: T } = { type, data }
         const mobileWindow: any = window as any
         mobileWindow.ReactNativeWebView.postMessage(JSON.stringify(body))
      }
   }

   public static setFullscreen(enabled: boolean): void {
      console.log(`[MobileUtils] Sending fullscreen message: ${enabled}`)
      this.send(MESSAGING_TYPE.SET_FULLSCREEN, { enabled })
   }

   /**
    * Reusable fullscreen utility for any component
    * @param enabled - Whether to enable fullscreen mode
    * @param callback - Optional callback to execute after fullscreen state change
    */
   public static toggleFullscreen(
      enabled: boolean,
      callback?: () => void
   ): void {
      if (this.webViewPresence()) {
         this.setFullscreen(enabled)

         // Execute callback after a short delay to ensure system bars have changed
         if (callback) {
            setTimeout(callback, 100)
         }
      }
   }

   public static webViewPresence(): boolean {
      if (typeof window === "undefined") return false

      const webViewWindow: any = window as any

      return !(
         !webViewWindow?.ReactNativeWebView ||
         typeof webViewWindow?.ReactNativeWebView?.postMessage !== "function"
      )
   }

   public static isAndroidWebView(): boolean {
      return (
         this.webViewPresence() &&
         navigator.userAgent.toLowerCase().includes("android")
      )
   }
}
