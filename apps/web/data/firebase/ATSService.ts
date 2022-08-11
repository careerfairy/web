import firebaseInstance from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import { v4 as uuidv4 } from "uuid"
import { MergeLinkTokenResponse } from "@careerfairy/shared-lib/dist/ats/MergeResponseTypes"

export class ATSService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   // not the group id to allow a group to have multiple integrations
   // also we don't leak the group id to the ATS provider
   generateIntegrationId() {
      const uuid = uuidv4()
      return uuid.replace(/-/g, "")
   }

   async linkCompanyWithATS(
      groupId: string,
      integrationId: string
   ): Promise<MergeLinkTokenResponse> {
      const data = await this.firebaseFunctions.httpsCallable(
         "mergeGenerateLinkToken"
      )({
         groupId,
         integrationId,
      })

      return data.data as MergeLinkTokenResponse
   }

   async exchangeAccountToken(
      groupId: string,
      integrationId: string,
      publicToken: string
   ): Promise<void> {
      await this.firebaseFunctions.httpsCallable("mergeGetAccountToken")({
         groupId,
         integrationId,
         publicToken,
      })
   }

   async removeAccount(groupId: string, integrationId: string): Promise<void> {
      await this.firebaseFunctions.httpsCallable("mergeRemoveAccount")({
         groupId,
         integrationId,
      })
   }
}

export const atsServiceInstance = new ATSService(firebaseInstance.functions())

export default ATSService
