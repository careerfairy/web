import { FunctionsInstance } from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import HttpsCallableResult = firebase.functions.HttpsCallableResult

export class CustomJobService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   async applyToAJob(
      livestreamId: string,
      jobId: string,
      userId: string
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable("userApplyToCustomJob_v2")({
         livestreamId,
         userId,
         jobId,
      })
   }

   /**
    * Synchronizes linked custom jobs for a livestream after creation or update.
    *
    * This function is designed to be triggered after the creation or update of a livestream.
    * It receives the livestreamId and an array of jobIds associated with the livestream.
    * The goal is to update the livestreams field on all relevant job documents.
    *
    * @param livestreamId
    * @param jobIds
    */
   async updateCustomJobWithLinkedLivestreams(
      livestreamId: string,
      jobIds: string[]
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable(
         "updateCustomJobWithLinkedLivestreams"
      )({
         livestreamId,
         jobIds,
      })
   }

   /**
    * Transfers all the linked custom jobs from a draft to a livestream
    * This function should be triggered after a draft is successfully published
    *
    * @param draftId
    * @param livestreamId
    */
   async transferCustomJobsFromDraftToPublishedLivestream(
      draftId: string,
      livestreamId: string,
      groupId: string
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable(
         "transferCustomJobsFromDraftToPublishedLivestream"
      )({
         draftId,
         livestreamId,
         groupId,
      })
   }
}

export const customJobServiceInstance = new CustomJobService(FunctionsInstance)

export default CustomJobService
