import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobApplicant,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import * as functions from "firebase-functions"
import { Timestamp } from "../api/firestoreAdmin"

export interface ICustomJobFunctionsRepository extends ICustomJobRepository {
   /**
    * This method creates the customJobStats collection based on the received customJob
    * @param newCustomJob
    */
   createCustomJobStats(newCustomJob: CustomJob): Promise<void>

   /**
    * This method syncs the customJobsStats job field based on the received customJob
    * @param updatedCustomJob
    */
   syncCustomJobDataToCustomJobStats(updatedCustomJob: CustomJob): Promise<void>

   /**
    * This method adds a deleted flag to the customJobStats document
    * @param deletedCustomJob
    */
   syncDeletedCustomJobDataToCustomJobStats(
      deletedCustomJob: CustomJob
   ): Promise<void>

   /**
    * This method removes the livestream ID from all the linked Jobs
    * @param livestreamId
    */
   removeLinkedLivestream(livestreamId: string): Promise<void>

   /**
    * This method syncs the JobApplication job field based on the received customJob
    * @param updatedCustomJob
    */
   syncCustomJobDataToJobApplications(
      updatedCustomJob: CustomJob
   ): Promise<void>

   /**
    * This method adds a deleted flag to the JobApplications document
    * @param deletedCustomJob
    */
   syncDeletedCustomJobDataToJobApplications(
      deletedCustomJob: CustomJob
   ): Promise<void>

   syncCustomJobDataGroupMetaData(groupId: string, group: Group): Promise<void>
}

export class CustomJobFunctionsRepository
   extends FirebaseCustomJobRepository
   implements ICustomJobFunctionsRepository
{
   async createCustomJobStats(newCustomJob: CustomJob): Promise<void> {
      const ref = this.firestore
         .collection("customJobStats")
         .doc(newCustomJob.id)

      functions.logger.log(
         `Create CustomJobStats for the job ${newCustomJob.id}.`
      )

      const newJobStat: CustomJobStats = {
         documentType: "customJobStats",
         jobId: newCustomJob.id,
         groupId: newCustomJob.groupId,
         clicks: 0,
         job: newCustomJob,
         id: newCustomJob.id,
         applicants: 0,
         deleted: false,
         deletedAt: null,
      }

      return ref.set(newJobStat, { merge: true })
   }

   async syncCustomJobDataToCustomJobStats(
      updatedCustomJob: CustomJob
   ): Promise<void> {
      functions.logger.log(
         `Sync CustomJobStats with job ${updatedCustomJob.id} data.`
      )

      const ref = this.firestore
         .collection("customJobStats")
         .doc(updatedCustomJob.id)

      return ref.update({ job: updatedCustomJob })
   }

   async syncDeletedCustomJobDataToCustomJobStats(
      deletedCustomJob: CustomJob
   ): Promise<void> {
      functions.logger.log(
         `Add deleted flag to the CustomJobStats with job ${deletedCustomJob.id}.`
      )

      const ref = this.firestore
         .collection("customJobStats")
         .doc(deletedCustomJob.id)

      return ref.update({
         deleted: true,
         deletedAt: Timestamp.now(),
      })
   }

   async removeLinkedLivestream(livestreamId: string): Promise<void> {
      const batch = this.firestore.batch()

      functions.logger.log(`Remove linked jobs from livestream ${livestreamId}`)

      const docs = await this.firestore
         .collection(this.COLLECTION_NAME)
         .where("livestreams", "array-contains", livestreamId)
         .get()

      if (docs.empty) {
         return
      }

      docs.forEach((doc) => {
         batch.update(doc.ref, {
            livestreams: this.fieldValue.arrayRemove(livestreamId),
         })
      })

      return batch.commit()
   }

   async syncCustomJobDataToJobApplications(
      updatedCustomJob: CustomJob
   ): Promise<void> {
      const batch = this.firestore.batch()

      functions.logger.log(
         `Sync JobApplications with job ${updatedCustomJob.id} data.`
      )

      const docs = await this.firestore
         .collection("JobApplications")
         .where("jobId", "==", updatedCustomJob.id)
         .get()

      if (docs.empty) {
         return
      }

      docs.forEach((doc) => {
         batch.update(doc.ref, {
            job: updatedCustomJob,
         })
      })

      return batch.commit()
   }

   async syncDeletedCustomJobDataToJobApplications(
      deletedCustomJob: CustomJob
   ): Promise<void> {
      const batch = this.firestore.batch()

      functions.logger.log(
         `Add deleted flag to the JobApplications with job ${deletedCustomJob.id}.`
      )

      const docs = await this.firestore
         .collection("JobApplications")
         .where("jobId", "==", deletedCustomJob.id)
         .get()

      if (docs.empty) {
         return
      }

      const customJobWithDeletedFlag: CustomJob = {
         ...deletedCustomJob,
         deleted: true,
      }

      docs.forEach((doc) => {
         batch.update(doc.ref, {
            job: customJobWithDeletedFlag,
         })
      })

      return batch.commit()
   }

   groupCustomJobsApplicationsQuery(groupId: string) {
      return this.firestore
         .collection("jobApplications")
         .where("groupId", "==", groupId)
   }

   // TODO: Improvement duplicated code on metadata synching
   async syncCustomJobDataGroupMetaData(
      groupId: string,
      group: Group
   ): Promise<void> {
      const groupJobsQuery = this.groupCustomJobsApplicationsQuery(groupId)
      console.log("🚀 ~ executing syncCustomJobDataGroupMetaData:", groupId)

      const snapshots = await groupJobsQuery.get()

      const groupCustomJobsWithRef = mapFirestoreDocuments<
         CustomJobApplicant,
         true
      >(snapshots, true)

      const chunks = chunkArray(groupCustomJobsWithRef, 450)

      const promises = chunks.map(async (chunk) => {
         const batch = this.firestore.batch()

         chunk.forEach((doc) => {
            const toUpdate: Pick<
               CustomJobApplicant,
               "companyCountry" | "companyIndustries" | "companySize"
            > = {
               companyCountry: group.companyCountry?.id,
               companyIndustries: group.companyIndustries?.map(
                  (industry) => industry.id
               ),
               companySize: group.companySize,
            }
            batch.update(doc._ref, toUpdate)
         })

         return batch.commit()
      })

      await Promise.allSettled(promises)
   }
}
