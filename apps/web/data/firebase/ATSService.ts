import firebaseInstance from "./FirebaseInstance"
import firebase from "firebase"
import { MergeLinkTokenResponse } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"

export class ATSService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   async linkCompanyWithATS(groupId: string): Promise<MergeLinkTokenResponse> {
      const data = await this.firebaseFunctions.httpsCallable(
         "mergeGenerateLinkToken"
      )({
         groupId,
      })

      return data.data as MergeLinkTokenResponse
   }

   async exchangeAccountToken(
      groupId: string,
      publicToken: string
   ): Promise<void> {
      await this.firebaseFunctions.httpsCallable("mergeGetAccountToken")({
         groupId,
         publicToken,
      })
   }
}

export const atsServiceInstance = new ATSService(firebaseInstance.functions())

export default ATSService
