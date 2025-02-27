import { CUSTOMERIO_CDP_API_KEY, CUSTOMERIO_SITE_ID } from "@env"
import {
   CioLogLevel,
   CioRegion,
   CustomerIO,
   PushClickBehaviorAndroid,
   type CioConfig,
} from "customerio-reactnative"

const cdpApiKey = CUSTOMERIO_CDP_API_KEY || "unknown"
const siteId = CUSTOMERIO_SITE_ID || "unknown"

class CustomerIOService {
   private static instance: CustomerIOService

   private constructor() {}

   static getInstance(): CustomerIOService {
      if (!CustomerIOService.instance) {
         CustomerIOService.instance = new CustomerIOService()
      }
      return CustomerIOService.instance
   }

   /**
    * Initializes the customerio sdk
    * @returns A promise that resolves when the customerio sdk is initialized
    */
   async initialize(): Promise<void> {
      if (CustomerIO.isInitialized()) return

      const config: CioConfig = {
         cdpApiKey,
         region: CioRegion.EU,
         logLevel:
            process.env.NODE_ENV === "development"
               ? CioLogLevel.Debug
               : CioLogLevel.Error,
         trackApplicationLifecycleEvents: true,
         inApp: {
            siteId,
         },
         push: {
            android: {
               pushClickBehavior:
                  PushClickBehaviorAndroid.ActivityPreventRestart,
            },
         },
      }

      return CustomerIO.initialize(config)
   }

   /**
    * Associates a user with their customerio user, all previous anonymous tracked events/screens before identifying will be associated with the user
    * @param userAuthId - The user's auth id
    * @returns A promise that resolves when the customer is identified
    */
   async identifyCustomer(userAuthId: string): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.identify({
         userId: userAuthId,
      })
   }

   /**
    * Tracks an event for customerio in the context of a Mobile App not a web app
    * @param event - The event to track
    * @param data - The data to track
    * @returns A promise that resolves when the event is tracked
    */
   async trackEvent(event: string, data: Record<string, any>): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.track(event, data)
   }

   /**
    * Tracks a screen for customerio in the context of a Mobile App not a web app
    * Screen is the mobile alternative for page in customerio
    * @param screenName - The screen name to track
    * @param data - The data to track
    * @returns A promise that resolves when the screen is tracked
    */
   async trackScreen(
      screenName: string,
      data: Record<string, any>
   ): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.screen(screenName, data)
   }

   /**
    * Clears the identity of the customer all future events will be tracked as an anonymous user
    */
   async clearCustomer(): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.clearIdentify()
   }

   /**
    * Gets the customerio generated push token for the current device
    * @returns A promise that resolves with the push token
    */
   async getPushToken(): Promise<string> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.pushMessaging.getRegisteredDeviceToken()
   }

   /**
    * Gets the current push permission status for the current device
    * @returns A promise that resolves with the current push permission status
    */
   async getPushPermissionStatus() {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.pushMessaging.getPushPermissionStatus()
   }

   /**
    * Requests push permission on the user's device
    * @returns A promise that resolves with the push permission status
    */
   async showPromptForPushNotifications() {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.pushMessaging.showPromptForPushNotifications()
   }
}

export const customerIO = CustomerIOService.getInstance()
