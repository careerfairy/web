import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobStats,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import { CustomJobMetaData } from "@careerfairy/shared-lib/groups/metadata"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import * as functions from "firebase-functions"
import { Change } from "firebase-functions"
import { chunk } from "lodash"
import { DocumentSnapshot, Timestamp } from "../api/firestoreAdmin"
import {
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "../api/repositories"

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
    * This method syncs the group data to the custom job, fetching all the custom jobs that are associated with the group
    * and updating the group field for each one of them.
    *
    * @param groupChange Change event from the group document
    * @param groupId ID of the group
    */
   syncGroupDataToCustomJob(
      groupChange: Change<DocumentSnapshot>,
      groupId: string
   ): Promise<void>

   /**
    * This method syncs the deleted job on all the linked live streams
    * @param deletedCustomJob
    */
   syncDeletedCustomJobToLinkedLivestreams(
      deletedCustomJob: CustomJob
   ): Promise<void>

   /**
    * This method syncs the deleted job on all the linked sparks
    * @param deletedCustomJob
    */
   syncDeletedCustomJobToLinkedSparks(
      deletedCustomJob: CustomJob
   ): Promise<void>

   /**
    * Notifies users with matching business functions tags according to the Custom Job (created).
    * @param customJob Newly created custom job.
    */
   createNewCustomJobUserNotifications(customJob: CustomJob): Promise<void>
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
         .collection("jobApplications")
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

   async syncGroupDataToCustomJob(
      groupChange: Change<DocumentSnapshot>,
      groupId: string
   ): Promise<void> {
      if (!groupChange.after.exists) {
         functions.logger.log(`Group ${groupId} was deleted, skipping sync`)
         return
      }

      functions.logger.log(
         `Sync group data to custom jobs for group ${groupId}`
      )

      const newGroup = {
         ...groupChange.after.data(),
         id: groupChange.after.id,
      } as Group

      const customJobsSnap = await this.firestore
         .collection("customJobs")
         .where("groupId", "==", groupId)
         .get()

      functions.logger.log(
         `Found ${customJobsSnap.size} custom jobs for group ${groupId}`
      )

      const batch = this.firestore.batch()

      const publicGroup = pickPublicDataFromGroup(newGroup)

      const toUpdate: Pick<CustomJob, "group"> = {
         group: {
            ...publicGroup,
            ...(publicGroup?.plan
               ? {
                    plan: {
                       ...publicGroup.plan,
                       startedAt: publicGroup.plan.startedAt
                          ? Timestamp.fromMillis(
                               publicGroup.plan.startedAt.toMillis()
                            )
                          : null,
                       expiresAt: publicGroup.plan.expiresAt
                          ? Timestamp.fromMillis(
                               publicGroup.plan.expiresAt.toMillis()
                            )
                          : null,
                    },
                 }
               : {}),
         },
      }

      customJobsSnap.forEach((doc) => {
         batch.update(doc.ref, toUpdate)
      })

      await batch.commit()

      functions.logger.log(
         `Synced group data to ${customJobsSnap.size} custom jobs for group ${groupId}`
      )
   }

   async syncDeletedCustomJobToLinkedLivestreams(
      deletedCustomJob: CustomJob
   ): Promise<void> {
      const batch = this.firestore.batch()

      const { livestreams, groupId } = deletedCustomJob
      const groupCustomJobs = await this.getCustomJobsByGroupId(groupId)
      const linkedLivestreams = await livestreamsRepo.getLivestreamsByIds(
         livestreams
      )

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

      // update live streams or draft live streams hasJobs flag
      livestreamsToUpdate.map((livestream) => {
         const collectionToUpdate = livestream.isDraft
            ? "draftLivestreams"
            : "livestreams"
         const ref = this.firestore
            .collection(collectionToUpdate)
            .doc(livestream.id)

         batch.update(ref, {
            hasJobs: false,
         })
      })

      return batch.commit()
   }

   async syncDeletedCustomJobToLinkedSparks(
      deletedCustomJob: CustomJob
   ): Promise<void> {
      const batch = this.firestore.batch()

      const { sparks, groupId } = deletedCustomJob
      const groupCustomJobs = await this.getCustomJobsByGroupId(groupId)

      const linkedSparks = await sparkRepo.getSparksByIds(sparks)

      // Filter out the deleted custom job from the group's custom jobs
      const filteredGroupJobs = groupCustomJobs.filter(
         (job) => job.id !== deletedCustomJob.id
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

      // update sparks hasJobs flag
      sparksToUpdate.map((spark) => {
         const ref = this.firestore.collection("sparks").doc(spark.id)

         batch.update(ref, {
            hasJobs: false,
         })
      })

      return batch.commit()
   }

   async createNewCustomJobUserNotifications(
      customJob: CustomJob
   ): Promise<void> {
      const jobEmoji = "💼"
      const jobLogId = `${customJob.id}-${customJob.title}`

      functions.logger.log(
         `${jobEmoji} Started creating custom job notifications for custom job ${jobLogId}`
      )

      const BATCH_SIZE = 200

      if (!customJob.published || customJob.isPermanentlyExpired) {
         functions.logger.log(
            `${jobEmoji} Custom job ${jobLogId} is not published or is expired. published: ${customJob.published}, expired: ${customJob.isPermanentlyExpired}`
         )
         return
      }
      if (!customJob.businessFunctionsTagIds?.length) {
         functions.logger.log(
            `${jobEmoji} Custom job ${jobLogId} has no business function tags, ignoring creation of notifications`
         )
         return
      }

      functions.logger.log(
         `${jobEmoji} Searching users with tags: ${customJob.businessFunctionsTagIds} from job ${jobLogId}`
      )

      const usersWithMatchingTags = await userRepo.getUsersWithTags(
         "businessFunctionsTagIds",
         customJob.businessFunctionsTagIds
      )

      if (!usersWithMatchingTags?.length) {
         functions.logger.log(
            `${jobEmoji} No users found with matching tags for custom job ${jobLogId}, ignoring creation of notifications`
         )
         return
      }

      functions.logger.log(
         `${jobEmoji} Creating notifications for ${usersWithMatchingTags.length} users for custom job ${jobLogId} (by matching businessFunctionsTagIds tags)`
      )

      const jobGroup = await groupRepo.getGroupById(customJob.groupId)

      const batchedUsers = chunk(usersWithMatchingTags, BATCH_SIZE)

      for (const userBatch of batchedUsers) {
         const batch = this.firestore.batch()

         for (const user of userBatch) {
            const ref = this.firestore
               .collection("userData")
               .doc(user.id)
               .collection("userNotifications")
               .doc()

            const newNotification: UserNotification = {
               documentType: "userNotification",
               actionUrl: `/company/${jobGroup.universityName}/jobs/${customJob.id}`,
               companyId: jobGroup.groupId,
               imageFormat: "circular",
               imageUrl: jobGroup.logoUrl,
               message: `<strong>${jobGroup.universityName}</strong> just posted a job that matches your profile: <strong>${customJob.title}</strong>`,
               buttonText: "Discover now",
               createdAt: Timestamp.now(),
               id: ref.id,
            }

            batch.set(ref, newNotification)
         }

         await batch.commit()
      }

      functions.logger.log(
         `${jobEmoji} Notified ${usersWithMatchingTags.length} users of job ${jobLogId} publication`
      )
   }
}
