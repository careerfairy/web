import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { GetRecommendedJobsFnArgs } from "@careerfairy/shared-lib/functions/types"
import { customJobRepo } from "data/RepositoryInstances"
import firebase from "firebase/compat/app"
import { httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"
import HttpsCallableResult = firebase.functions.HttpsCallableResult

export class CustomJobService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   async getRecommendedJobs(
      limit: number,
      userAuthId: string,
      bypassCache: boolean = false,
      referenceJobId?: string
   ): Promise<CustomJob[]> {
      const { data: jobIds } = await httpsCallable<
         GetRecommendedJobsFnArgs,
         string[]
      >(
         this.firebaseFunctions,
         FUNCTION_NAMES.getRecommendedJobs
      )({
         limit,
         userAuthId,
         bypassCache,
         referenceJobId,
      })

      if (!jobIds?.length) return []

      return customJobRepo.getCustomJobByIdsStrict(jobIds)
   }

   async confirmJobApplication(
      jobId: string,
      userId: string
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable("confirmUserJobApplication")({
         authId: userId,
         jobId,
      })
   }

   async confirmAnonymousJobApplication(
      jobId: string,
      fingerPrintId: string
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable(
         "confirmAnonymousJobApplication"
      )({
         authId: fingerPrintId,
         jobId,
      })
   }

   /**
    * Removes the job application for the specified user and job via cloud function after a user confirms the removal of the job
    * in the confirmation dialog.
    *
    * The removal only sets the property 'removed' to true, which will remove the job from being displayed on the user profile.
    * The user job application is not actually removed, only a flag is set to true indicating the user wishing its removal from his profile.
    * @param jobId Id of the job the user wishes the application not to appear anymore on the his profile.
    * @param userId Id of the user.
    */
   async removeUserJobApplication(
      jobId: string,
      userId: string
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable(
         "setRemoveUserJobApplication"
      )({
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
         "updateCustomJobWithLinkedLivestreams_v2"
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
         "transferCustomJobsFromDraftToPublishedLivestream_v2"
      )({
         draftId,
         livestreamId,
         groupId,
      })
   }
}

export const customJobServiceInstance = new CustomJobService(FunctionsInstance)

export default CustomJobService
