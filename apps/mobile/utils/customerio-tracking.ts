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

   async identifyCustomer(userAuthId: string): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.identify({
         userId: userAuthId,
      })
   }

   async trackEvent(event: string, data: Record<string, any>): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.track(event, data)
   }

   async trackScreen(
      screenName: string,
      data: Record<string, any>
   ): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.screen(screenName, data)
   }

   async clearCustomer(): Promise<void> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.clearIdentify()
   }

   async getPushToken(): Promise<string> {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.pushMessaging.getRegisteredDeviceToken()
   }

   async getPushPermissionStatus() {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.pushMessaging.getPushPermissionStatus()
   }

   async showPromptForPushNotifications() {
      if (!CustomerIO.isInitialized()) {
         await this.initialize()
      }

      return CustomerIO.pushMessaging.showPromptForPushNotifications()
   }
}

export const customerIO = CustomerIOService.getInstance()
