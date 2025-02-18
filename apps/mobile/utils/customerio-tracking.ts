import { CUSTOMERIO_CDP_API_KEY, CUSTOMERIO_SITE_ID } from "@env"
import { type CioConfig } from "customerio-reactnative"
import Constants from "expo-constants"

const cdpApiKey = CUSTOMERIO_CDP_API_KEY || "unknown"
const siteId = CUSTOMERIO_SITE_ID || "unknown"

class CustomerIOService {
   private static instance: CustomerIOService
   private initialized = false
   private isExpoGo = Constants.appOwnership === "expo"

   private constructor() {}

   static getInstance(): CustomerIOService {
      if (!CustomerIOService.instance) {
         CustomerIOService.instance = new CustomerIOService()
      }
      return CustomerIOService.instance
   }

   async initialize(): Promise<void> {
      if (this.isExpoGo) {
         console.log("CustomerIO not available in Expo Go")
         return
      }

      if (this.initialized) return

      try {
         const {
            CioLogLevel,
            CioRegion,
            CustomerIO,
            PushClickBehaviorAndroid,
         } = await import("customerio-reactnative")

         const config: CioConfig = {
            cdpApiKey,
            region: CioRegion.EU,
            logLevel: CioLogLevel.Debug,
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

         await CustomerIO.initialize(config)
         this.initialized = true
         console.log("CustomerIO initialized")
      } catch (error) {
         console.error(`Error initializing CustomerIO: ${error}`)
      }
   }

   async identifyCustomer(userAuthId: string): Promise<void> {
      if (this.isExpoGo) return

      if (!this.initialized) {
         await this.initialize()
      }

      try {
         const CustomerIO = await getCustomerIO()
         await CustomerIO.identify({
            userId: userAuthId,
         })
      } catch (error) {
         console.error(`Error identifying customer: ${error}`)
      }
   }

   async trackEvent(event: string, data: Record<string, any>): Promise<void> {
      if (this.isExpoGo) return

      if (!this.initialized) {
         await this.initialize()
      }

      try {
         const CustomerIO = await getCustomerIO()
         await CustomerIO.track(event, data)
      } catch (error) {
         console.error(`Error tracking event: ${error}`)
      }
   }

   async trackScreen(
      screenName: string,
      data: Record<string, any>
   ): Promise<void> {
      if (this.isExpoGo) return

      if (!this.initialized) {
         await this.initialize()
      }

      try {
         const CustomerIO = await getCustomerIO()
         await CustomerIO.screen(screenName, data)
      } catch (error) {
         console.error(`Error tracking screen: ${error}`)
      }
   }

   async clearCustomer(): Promise<void> {
      if (this.isExpoGo) return

      if (!this.initialized) {
         await this.initialize()
      }

      try {
         const CustomerIO = await getCustomerIO()
         await CustomerIO.clearIdentify()
         console.log("Cleared customer")
      } catch (error) {
         console.error(`Error clearing customer: ${error}`)
      }
   }
}

const getCustomerIO = async () => {
   const { CustomerIO } = await import("customerio-reactnative")
   return CustomerIO
}

export const customerIO = CustomerIOService.getInstance()
