import firebaseInstance from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import { MarketingUserCreationFields } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"

export class MarketingService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   async create(data: MarketingUserCreationFields): Promise<void> {
      await this.firebaseFunctions.httpsCallable("createMarketingUser_eu")(data)
   }
}

export const marketingServiceInstance = new MarketingService(
   firebaseInstance.functions()
)

export default MarketingService
