import firebaseInstance, {
   FieldValue,
   FunctionsInstance,
} from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import { v4 as uuidv4 } from "uuid"
import {
   MergeExtraRequiredData,
   MergeLinkTokenResponse,
} from "@careerfairy/shared-lib/dist/ats/merge/MergeResponseTypes"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccountDocument } from "@careerfairy/shared-lib/dist/groups"
import {
   ATSDataPaginationOptions,
   ATSPaginatedResults,
} from "@careerfairy/shared-lib/dist/ats/Functions"

export class ATSService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions,
      private readonly firestore: firebase.firestore.Firestore
   ) {}

   // not the group id to allow a group to have multiple integrations
   // also we don't leak the group id to the ATS provider
   generateIntegrationId() {
      const uuid = uuidv4()
      return uuid.replace(/-/g, "")
   }

   /**
    * Gets all the jobs for a given integration
    *
    * This can fan out to several ats requests since we'll need to go
    * through paginated responses
    * @param groupId
    * @param integrationId
    */
   async getAllJobs(groupId: string, integrationId: string): Promise<Job[]> {
      const data = await this.firebaseFunctions.httpsCallable(
         "fetchATSJobs_eu"
      )({
         groupId,
         integrationId,
         allJobs: true,
      })

      return data.data.results
         .map(Job.createFromPlainObject)
         .map((job: Job) => {
            job.setIntegrationId(integrationId)
            return job
         })
   }

   /**
    * Get Jobs Paginated
    * @param groupId
    * @param integrationId
    * @param pagination
    */
   async getJobs(
      groupId: string,
      integrationId: string,
      pagination?: ATSDataPaginationOptions
   ): Promise<ATSPaginatedResults<Job>> {
      let params = {
         groupId,
         integrationId,
      }

      if (pagination) {
         params = {
            ...params,
            ...pagination,
         }
      }

      const data = await this.firebaseFunctions.httpsCallable(
         "fetchATSJobs_eu"
      )(params)

      let mappedData = data.data.results
         .map(Job.createFromPlainObject)
         .map((job: Job) => {
            job.setIntegrationId(integrationId)
            return job
         })

      return {
         ...data.data,
         results: mappedData,
      }
   }

   /**
    * Create a test application for a job
    *
    * @param groupId
    * @param integrationId
    * @param jobId
    * @param mergeExtraRequiredData
    */
   async candidateApplicationTest(
      groupId: string,
      integrationId: string,
      jobId: string,
      mergeExtraRequiredData?: MergeExtraRequiredData
   ): Promise<void> {
      const data = await this.firebaseFunctions.httpsCallable(
         "candidateApplicationTest_eu"
      )({
         groupId,
         integrationId,
         jobId,
         mergeExtraRequiredData,
      })

      return data.data
   }

   async linkCompanyWithATS(
      groupId: string,
      integrationId: string
   ): Promise<MergeLinkTokenResponse> {
      const data = await this.firebaseFunctions.httpsCallable(
         "mergeGenerateLinkToken_eu"
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
      await this.firebaseFunctions.httpsCallable("mergeGetAccountToken_eu")({
         groupId,
         integrationId,
         publicToken,
      })
   }

   async removeAccount(groupId: string, integrationId: string): Promise<void> {
      await this.firebaseFunctions.httpsCallable("mergeRemoveAccount_eu")({
         groupId,
         integrationId,
      })
   }

   async applyToAJob(livestreamId: string, jobId: string): Promise<any> {
      return this.firebaseFunctions.httpsCallable("atsUserApplyToJob_eu")({
         livestreamId,
         jobId,
      })
   }

   async updateUserJobApplications(): Promise<void> {
      await this.firebaseFunctions.httpsCallable(
         "updateUserJobApplications_eu"
      )()
   }

   async setFirstSyncComplete(
      groupId: string,
      integrationId: string
   ): Promise<void> {
      const docRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)

      const toUpdate: Partial<GroupATSAccountDocument> = {}
      // update a nested object property
      toUpdate["merge.firstSyncCompletedAt"] = FieldValue.serverTimestamp()

      await docRef.update(toUpdate)
   }

   async setAccountCandidateTestComplete(
      groupId: string,
      integrationId: string,
      extraData?: MergeExtraRequiredData
   ): Promise<void> {
      const docRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("ats")
         .doc(integrationId)

      const toUpdate: Partial<GroupATSAccountDocument> = {}

      // update a nested object property
      toUpdate["merge.applicationTestCompletedAt"] =
         FieldValue.serverTimestamp()
      toUpdate["merge.extraRequiredData"] = extraData ?? null

      await docRef.update(toUpdate)
   }
}

export const atsServiceInstance = new ATSService(
   FunctionsInstance,
   firebaseInstance.firestore()
)

export default ATSService
