import Constants from "expo-constants"
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency"
import { AppEventsLogger, Settings } from "react-native-fbsdk-next"

export const initializeFacebookTracking = async () => {
   try {
      // Check if we're in Expo Go
      const isExpoGo = Constants.appOwnership === "expo"

      if (isExpoGo) {
         console.log(
            "Facebook tracking not available in Expo Go - please use development build"
         )
         return
      }

      // Request tracking permission (iOS requirement)
      const { status } = await requestTrackingPermissionsAsync()

      // Initialize Facebook SDK
      Settings.initializeSDK()

      // Enable tracking if permission granted
      if (status === "granted") {
         await Settings.setAdvertiserTrackingEnabled(true)
      }

      // Log app activation
      AppEventsLogger.logEvent("fb_mobile_activate_app")

      console.log("Facebook tracking initialized successfully")
   } catch (error) {
      console.error(`Failed to initialize Facebook tracking: ${error}`)
   }
}
