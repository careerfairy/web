import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import * as functions from "firebase-functions"
import { Change } from "firebase-functions"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { DocumentSnapshot } from "firebase-admin/firestore"
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
    * To sync the connection between the livestream and the pre-existing custom jobs
    */
   syncLivestreamIdWithCustomJobs(
      livestream: Change<DocumentSnapshot>
   ): Promise<void>

   /**
    * This method adds a deleted flag to the customJobStats document
    * @param deletedCustomJob
    */
   deleteAndSyncCustomJob(deletedCustomJob: CustomJob): Promise<void>
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

   async syncLivestreamIdWithCustomJobs(
      livestream: Change<DocumentSnapshot>
   ): Promise<void> {
      const batch = this.firestore.batch()
      const newLivestream = livestream.after?.data() as LivestreamEvent
      const previousLivestream = livestream.before?.data() as LivestreamEvent

      const groupId =
         newLivestream?.groupIds?.[0] || previousLivestream?.groupIds?.[0]
      const livestreamId = newLivestream?.id || previousLivestream?.id

      const newJobs = newLivestream?.customJobs || []
      const oldJobs = previousLivestream?.customJobs || []

      // To get a list of jobs that have been removed as a result of this update or deletion action
      const jobsToRemoveLivestreamId = oldJobs.filter(
         ({ id: oldJobId }) =>
            !newJobs.some(({ id: newJobId }) => newJobId === oldJobId)
      )

      // To get a list of jobs that have been added as a result of this update or creation action
      const jobsToAddLivestreamId = newJobs.filter(
         ({ id: newJobId }) =>
            !oldJobs.some(({ id: oldJobId }) => oldJobId === newJobId)
      )

      if (Boolean(!groupId) || Boolean(!livestreamId)) {
         // If there are no valid group id or livestream id at this moment, no additional work is required
         return
      }

      if (
         jobsToAddLivestreamId.length === 0 &&
         jobsToRemoveLivestreamId.length === 0
      ) {
         // If there are no jobs to be added or removed, it indicates that no changes have been made to the custom job field
         // so no additional work is required
         return
      }

      jobsToAddLivestreamId.forEach((job) => {
         const ref = this.firestore.collection("customJobs").doc(job.id)

         batch.update(ref, {
            livestreams: this.fieldValue.arrayUnion(livestreamId),
         })
      })

      for (const job of jobsToRemoveLivestreamId) {
         const ref = this.firestore.collection("customJobs").doc(job.id)

         const docSnap = await ref.get()

         // when deleting the livestream from a job
         // is required to confirm if the job does still exist
         if (docSnap.exists) {
            batch.update(ref, {
               livestreams: this.fieldValue.arrayRemove(livestreamId),
            })
         }
      }

      return await batch.commit()
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
}
