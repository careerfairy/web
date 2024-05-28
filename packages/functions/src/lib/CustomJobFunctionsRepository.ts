import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { CustomJobMetaData } from "@careerfairy/shared-lib/groups/metadata"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import * as functions from "firebase-functions"
import { customJobRepo, livestreamsRepo, sparkRepo } from "src/api/repositories"
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
    * This method removes the spark ID from all the linked Jobs
    * @param sparkId
    */
   removeLinkedSpark(sparkId: string): Promise<void>

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

   /**
    * Cascades data from Group to the custom jobApplications from the input Group.
    * @param groupId ID of the group, used as a parameter since some groups might not have a groupId
    * @param group Group object
    */
   syncCustomJobDataGroupMetaData(groupId: string, group: Group): Promise<void>

   /**
    * This method syncs the deleted job on all the linked content
    * @param deletedCustomJob
    */
   syncDeletedCustomJobToLinkedContent(
      deletedCustomJob: CustomJob
   ): Promise<void>
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
         const job = doc.data() as CustomJob
         let isJobPublished = job.published

         // If the job has no linked sparks and is removing its last linked live stream, we want to unpublish this custom job
         if (job.livestreams.length === 1 && job.sparks.length === 0) {
            isJobPublished = false
         }

         batch.update(doc.ref, {
            livestreams: this.fieldValue.arrayRemove(livestreamId),
            published: isJobPublished,
         })
      })

      return batch.commit()
   }

   async removeLinkedSpark(sparkId: string): Promise<void> {
      const batch = this.firestore.batch()

      functions.logger.log(`Remove linked jobs from spark ${sparkId}`)

      const docs = await this.firestore
         .collection(this.COLLECTION_NAME)
         .where("sparks", "array-contains", sparkId)
         .get()

      if (docs.empty) {
         return
      }

      docs.forEach((doc) => {
         const job = doc.data() as CustomJob
         let isJobPublished = job.published

         // If the job has no linked live streams and is removing its last linked spark, we want to unpublish this custom job
         if (job.sparks.length === 1 && job.livestreams.length === 0) {
            isJobPublished = false
         }

         batch.update(doc.ref, {
            sparks: this.fieldValue.arrayRemove(sparkId),
            published: isJobPublished,
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

      const snapshots = await groupJobsQuery.get()
      const chunks = chunkArray(snapshots.docs, 450)
      const promises = chunks.map(async (chunk) => {
         const batch = this.firestore.batch()
         chunk.forEach((doc) => {
            const toUpdate: CustomJobMetaData = {
               companyCountry: group.companyCountry?.id,
               companyIndustries: group.companyIndustries?.map(
                  (industry) => industry.id
               ),
               companySize: group.companySize,
            }
            batch.update(doc.ref, toUpdate)
         })
         return batch.commit()
      })

      await Promise.allSettled(promises)
   }

   async syncDeletedCustomJobToLinkedContent(
      deletedCustomJob: CustomJob
   ): Promise<void> {
      const batch = this.firestore.batch()

      const { livestreams, sparks, groupId } = deletedCustomJob
      const groupCustomJobs = await customJobRepo.getCustomJobsByGroupId(
         groupId
      )
      const linkedLivestreams = await livestreamsRepo.getLivestreamsByIds(
         livestreams
      )
      const linkedSparks = await sparkRepo.getSparksByIds(sparks)

      // Filter out the deleted custom job from the group's custom jobs
      const filteredGroupJobs = groupCustomJobs.filter(
         (job) => job.id !== deletedCustomJob.id
      )

      const livestreamsToUpdate = linkedLivestreams.filter(
         (livestream: LivestreamEvent) => {
            // If the livestream has associated ATS jobs, do nothing
            if (livestream.jobs.length > 0) {
               return false
            }

            // Check if any other custom job in the group links to this livestream
            const hasMoreCustomJobsThanTheDeletedOne = filteredGroupJobs.some(
               (customJob) =>
                  customJob.livestreams.some(
                     (linkedLivestream) => linkedLivestream === livestream.id
                  )
            )

            // If another custom job links to this livestream, do nothing
            if (hasMoreCustomJobsThanTheDeletedOne) {
               return false
            }

            // Otherwise, mark this livestream for update
            return true
         }
      )

      const sparksToUpdate = linkedSparks.filter((spark) => {
         // Check if any other custom job in the group links to this spark
         const hasMoreCustomJobsThanTheDeletedOne = filteredGroupJobs.some(
            (customJob) =>
               customJob.sparks.some(
                  (linkedSparks) => linkedSparks === spark.id
               )
         )

         // If another custom job links to this spark, do nothing
         if (hasMoreCustomJobsThanTheDeletedOne) {
            return false
         }

         // Otherwise, mark this spark for update
         return true
      })

      // update live streams hasJobs flag
      livestreamsToUpdate.map((livestream) => {
         const ref = this.firestore.collection("livestreams").doc(livestream.id)

         batch.update(ref, {
            hasJobs: true,
         })
      })

      // update sparks hasJobs flag
      sparksToUpdate.map((spark) => {
         const ref = this.firestore.collection("sparks").doc(spark.id)

         batch.update(ref, {
            hasJobs: true,
         })
      })

      return batch.commit()
   }
}
