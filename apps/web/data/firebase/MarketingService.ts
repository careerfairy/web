import { MarketingUserCreationFields } from "@careerfairy/shared-lib/marketing/MarketingUser"
import firebase from "firebase/compat/app"
import { FunctionsInstance } from "./FirebaseInstance"

export class MarketingService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   async create(data: MarketingUserCreationFields): Promise<void> {
      await this.firebaseFunctions.httpsCallable("createMarketingUser_eu")(data)
   }
}

export const marketingServiceInstance = new MarketingService(FunctionsInstance)

export default MarketingService
