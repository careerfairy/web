import Constants from "expo-constants"
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency"
import { AppEventsLogger, Settings } from "react-native-fbsdk-next"

/**
 * Initializes Facebook tracking SDK for marketing analytics.
 *
 * On iOS 14+, this will trigger Apple's App Tracking Transparency prompt.
 * This is required by Apple's privacy guidelines and App Store policies:
 * @see https://developer.apple.com/app-store/user-privacy-and-data-use/
 * @see https://developer.apple.com/documentation/apptrackingtransparency
 *
 * Facebook SDK documentation on iOS 14+ requirements:
 * @see https://developers.facebook.com/docs/app-events/guides/advertising-tracking-enabled/
 *
 * The prompt message is configured in app.json as "iosUserTrackingPermission".
 * Users must explicitly allow tracking for full Facebook analytics to work.
 *
 * Message shown to users (configured in app.json):
 * "This identifier will be used to deliver personalized ads to you."
 *
 * If denied:
 * - Limited tracking capabilities
 * - Reduced marketing analytics accuracy
 * - Campaign attribution may be affected
 */
export const initializeFacebookTracking = async () => {
   try {
      const isExpoGo = Constants.appOwnership === "expo"

      if (isExpoGo) {
         console.log(
            "Facebook tracking not available in Expo Go - please use development build"
         )
         return
      }

      /**
       * Request permission to track user data (email, device ID, ad ID etc).
       * iOS 14.5+ requires explicit user consent. Permission persists until app reinstall.
       * Always granted on Android, web and iOS 13 or below.
       */
      const { status } = await requestTrackingPermissionsAsync()

      Settings.initializeSDK()

      if (status === "granted") {
         await Settings.setAdvertiserTrackingEnabled(true)
      }

      AppEventsLogger.logEvent("fb_mobile_activate_app")

      console.log("Facebook tracking initialized successfully")
   } catch (error) {
      console.error(
         `Failed to initialize Facebook tracking: ${JSON.stringify(
            error,
            null,
            2
         )}`
      )
   }
}
