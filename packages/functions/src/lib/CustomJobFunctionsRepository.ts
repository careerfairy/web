import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
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
   deleteAndSyncCustomJob(deletedCustomJob: CustomJob): Promise<void>

   /**
    * This method removes the livestream ID from all the linked Jobs
    * @param livestreamId
    */
   removeLinkedLivestream(livestreamId: string): Promise<void>
}

export class CustomJobFunctionsRepository
   extends FirebaseCustomJobRepository
   implements ICustomJobFunctionsRepository
{
   async createCustomJobStats(newCustomJob: CustomJob): Promise<void> {
      const jobStatsId = `${newCustomJob.groupId}_${newCustomJob.id}`

      const ref = this.firestore.collection("customJobStats").doc(jobStatsId)

      functions.logger.log(
         `Create CustomJobStats for the job ${newCustomJob.id}.`
      )

      const newJobStat: CustomJobStats = {
         documentType: "customJobStats",
         jobId: newCustomJob.id,
         groupId: newCustomJob.groupId,
         clicks: 0,
         job: newCustomJob,
         id: jobStatsId,
         applicants: 0,
         deleted: false,
      }

      return ref.set(newJobStat, { merge: true })
   }

   async syncCustomJobDataToCustomJobStats(
      updatedCustomJob: CustomJob
   ): Promise<void> {
      functions.logger.log(
         `Sync CustomJobStats with job ${updatedCustomJob.id} data.`
      )

      const jobStatsId = `${updatedCustomJob.groupId}_${updatedCustomJob.id}`

      const ref = this.firestore.collection("customJobStats").doc(jobStatsId)

      return ref.update({ job: updatedCustomJob })
   }

   async deleteAndSyncCustomJob(deletedCustomJob: CustomJob): Promise<void> {
      functions.logger.log(
         `Add deleted flag to the CustomJobStats with job ${deletedCustomJob.id}.`
      )

      const jobStatsId = `${deletedCustomJob.groupId}_${deletedCustomJob.id}`

      const ref = this.firestore.collection("customJobStats").doc(jobStatsId)

      return ref.update({
         deleted: true,
         deletedAt: Timestamp.now(),
         job: {
            ...deletedCustomJob,
            deleted: true,
         },
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
}
