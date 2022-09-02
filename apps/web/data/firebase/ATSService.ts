import firebaseInstance, { FieldValue } from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import { v4 as uuidv4 } from "uuid"
import { MergeLinkTokenResponse } from "@careerfairy/shared-lib/dist/ats/MergeResponseTypes"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccountDocument } from "@careerfairy/shared-lib/dist/groups"

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

   async getJobs(groupId: string, integrationId: string): Promise<Job[]> {
      const data = await this.firebaseFunctions.httpsCallable("fetchATSJobs")({
         groupId,
         integrationId,
      })

      return data.data.map(Job.createFromPlainObject).map((job: Job) => {
         job.setIntegrationId(integrationId)
         return job
      })
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

   async applyToAJob(livestreamId: string, jobId: string): Promise<any> {
      return this.firebaseFunctions.httpsCallable("atsUserApplyToJob")({
         livestreamId,
         jobId,
      })
   }

   async updateUserJobApplications(): Promise<void> {
      await this.firebaseFunctions.httpsCallable("updateUserJobApplications")()
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
}

export const atsServiceInstance = new ATSService(
   firebaseInstance.functions(),
   firebaseInstance.firestore()
)

export default ATSService
