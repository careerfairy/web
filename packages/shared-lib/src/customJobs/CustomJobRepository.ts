import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { Timestamp } from "../firebaseTypes"
import { UserData } from "../users"
import { chunkArray } from "../utils"
import {
   AnonymousJobApplication,
   CustomJob,
   CustomJobApplicant,
   CustomJobApplicationSource,
   PublicCustomJob,
   getMaxDaysAfterDeadline,
} from "./customJobs"

export interface ICustomJobRepository {
   /**
    * To create a custom job on the CustomJob root collection
    * If linkedLivestreamId adds on the livestreams array field
    *
    * @param job
    * @param linkedLivestreamId
    */
   createCustomJob(
      job: PublicCustomJob,
      linkedLivestreamId?: string
   ): Promise<CustomJob>

   /**
    * To update an existing custom job on the CustomJob root collection
    * @param job
    */
   updateCustomJob(job: Partial<CustomJob>): Promise<void>

   /**
    * To delete a custom job on the CustomJob root collection
    * @param jobId
    */
   deleteCustomJob(jobId: string): Promise<void>

   /**
    * To get a custom job by id from the CustomJob root collection
    * @param jobId
    */
   getCustomJobById(jobId: string): Promise<CustomJob>

   /**
    * To get a custom jobs by ids from the CustomJob root collection
    * @param jobIds
    */
   getCustomJobByIds(jobIds: string[]): Promise<CustomJob[]>

   /**
    * To get a custom job application by user and job id from the jobApplications root collection
    * @param userId
    * @param jobId
    */
   getUserJobApplication(userId: string, jobId: string): Promise<CustomJob>

   getAnonymousJobApplication(
      fingerPrintId: string,
      jobId: string
   ): Promise<AnonymousJobApplication>

   /**
    * To create or update an existing jobApplication with a new applicant
    * Also increase the applicants field on the corresponding jobStats document
    * @param user
    * @param job
    * @param livestreamId
    */
   applyUserToCustomJob(
      user: UserData,
      job: CustomJob,
      applicationSource: CustomJobApplicationSource
   ): Promise<void>

   /**
    * Handles anonymous user custom job applications, while also taking into consideration
    * that multiple applications can be made for the anon user.
    * @param fingerPrintId
    * @param job
    * @param contentId
    * @param contentType
    */
   applyAnonymousUserToCustomJob(
      fingerPrintId: string,
      job: CustomJob,
      applicationSource: CustomJobApplicationSource
   ): Promise<void>

   /**
    * Confirms a successful job application for an user, implying an initiation of the application to already
    * be done.
    * @param user User for which the application will be confirmed.
    * @param jobId ID of the job the user is applying to.
    */
   confirmUserApplicationToCustomJob(
      user: UserData,
      jobId: string
   ): Promise<void>

   confirmAnonymousUserApplicationToCustomJob(
      fingerPrintId: string,
      jobId: string
   ): Promise<void>

   setRemovedUserCustomJobApplication(
      userId: string,
      jobId: string
   ): Promise<void>

   /**
    * To increment the 'clicks' field on a specific customJob
    * @param jobId
    */
   incrementCustomJobClicks(jobId: string): Promise<void>

   /**
    * Get all the custom jobs linked by a specific live stream
    * @param livestreamId
    */
   getCustomJobsByLivestreamId(livestreamId: string): Promise<CustomJob[]>

   /**
    * Update the livestream id as linked livestream to the customJobs
    * @param livestreamId
    * @param jobIdsToUpdate
    * @param toRemove
    */
   updateCustomJobWithLinkedLivestreams(
      livestreamId: string,
      jobIdsToUpdate: string[],
      toRemove?: boolean
   ): Promise<void>

   /**
    * Retrieves a list of customJobs where the given ids by @param ids is included in the
    * relationship designed by @param linkField, meaning its value must be an array field of customJobs document
    * where valid ids are to be present.
    * @param linkField customJobs field for matching ids
    * @param ids list of identifiers for which the field @param linkField will be filtered by.
    */
   getCustomJobsByLinkedContentIds(
      linkField: string,
      ids: string[]
   ): Promise<CustomJob[]>

   /**
    * Get all the custom jobs linked by a specific group
    * @param groupId
    */
   getGroupJobs(groupId: string): Promise<CustomJob[]>

   /**
    * Get all group custom jobs by group ID
    * @param groupId
    */
   getCustomJobsByGroupId(groupId: string): Promise<CustomJob[]>

   groupHasPublishedCustomJobs(
      groupId: string,
      limit?: number
   ): Promise<boolean>
   /**
    * Update all custom jobs that are expired for more than 30 days to be permanently expired
    */
   syncPermanentlyExpiredCustomJobs(): Promise<void>

   /**
    * Update all custom jobs that have expired
    */
   syncExpiredCustomJobs(): Promise<void>
}

export class FirebaseCustomJobRepository
   extends BaseFirebaseRepository
   implements ICustomJobRepository
{
   protected readonly COLLECTION_NAME = "customJobs"

   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   private getJobApplicationId(jobId: string, userId: string) {
      return `${jobId}_${userId}`
   }

   async createCustomJob(
      job: PublicCustomJob,
      linkedLivestreamId: string
   ): Promise<CustomJob> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc()
      const now = this.fieldValue.serverTimestamp() as Timestamp

      const isPublished = Boolean(
         job.livestreams.length || job.sparks.length || linkedLivestreamId
      )

      const newJob: CustomJob = {
         documentType: this.COLLECTION_NAME,
         ...job,
         createdAt: now,
         updatedAt: now,
         livestreams: linkedLivestreamId
            ? [linkedLivestreamId]
            : job.livestreams,
         id: ref.id,
         published: isPublished,
         isPermanentlyExpired: false,
         deleted: false,
      }

      await ref.set(newJob, { merge: true })

      return newJob
   }

   async updateCustomJob(job: Partial<CustomJob>): Promise<void> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(job.id)
      const now = this.fieldValue.serverTimestamp() as Timestamp

      const hasContent =
         !job?.deleted && (job.livestreams.length > 0 || job.sparks.length > 0)
      const expired = now < job.deadline

      const updatedJob: Partial<CustomJob> = {
         ...job,
         updatedAt: now,
         published: !expired && hasContent,
      }

      await ref.update(updatedJob)
   }

   async deleteCustomJob(jobId: string): Promise<void> {
      const customJobRef = this.firestore
         .collection(this.COLLECTION_NAME)
         .doc(jobId)

      return customJobRef.delete()
   }

   async getCustomJobById(jobId: string): Promise<CustomJob> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(jobId)

      const snapshot = await ref.get()

      if (snapshot.exists) {
         return this.addIdToDoc<CustomJob>(snapshot)
      }
      return null
   }

   async getCustomJobByIds(jobIds: string[]): Promise<CustomJob[]> {
      const chunks = chunkArray(jobIds, 10)
      const promises = []

      for (const chunk of chunks) {
         promises.push(
            this.firestore
               .collection(this.COLLECTION_NAME)
               .where("id", "in", chunk)
               .get()
               .then(mapFirestoreDocuments)
         )
      }

      const responses = await Promise.allSettled(promises)

      return responses
         .filter((r) => {
            if (r.status === "fulfilled") {
               return true
            } else {
               // only log for debugging purposes
               console.error("Promise failed", r)
            }

            return false
         })
         .map((r) => (r as PromiseFulfilledResult<CustomJob[]>).value)
         .flat()
   }

   async getUserJobApplication(
      userId: string,
      jobId: string
   ): Promise<CustomJob> {
      const applicationId = `${jobId}_${userId}`

      const ref = this.firestore
         .collection("jobApplications")
         .doc(applicationId)

      const snapshot = await ref.get()

      if (snapshot.exists) {
         return this.addIdToDoc<CustomJob>(snapshot)
      }
      return null
   }

   async getAnonymousJobApplication(
      fingerPrintId: string,
      jobId: string
   ): Promise<AnonymousJobApplication> {
      const id = this.getJobApplicationId(jobId, fingerPrintId)

      const ref = this.firestore.collection("anonymousJobApplications").doc(id)

      const snapshot = await ref.get()

      if (snapshot.exists) {
         return this.addIdToDoc<AnonymousJobApplication>(snapshot)
      }
      return null
   }

   async applyUserToCustomJob(
      user: UserData,
      job: CustomJob,
      applicationSource: CustomJobApplicationSource
   ): Promise<void> {
      const applicationId = this.getJobApplicationId(job.id, user.id)

      const newJobApplicant: CustomJobApplicant = {
         documentType: "customJobApplicant",
         id: applicationId,
         jobId: job.id,
         groupId: job.groupId,
         applicationSource: applicationSource,
         appliedAt: null, // Initial application not confirmed so null date
         user,
         job,
         applied: false,
         createdAt: this.fieldValue.serverTimestamp() as Timestamp,
         removedFromUserProfile: false,
      }

      return this.firestore
         .collection("jobApplications")
         .doc(applicationId)
         .set(newJobApplicant)
   }

   async applyAnonymousUserToCustomJob(
      fingerPrintId: string,
      job: CustomJob,
      applicationSource: CustomJobApplicationSource
   ): Promise<void> {
      const anonApplicationId = this.getJobApplicationId(job.id, fingerPrintId)

      const newAnonApplication: AnonymousJobApplication = {
         id: anonApplicationId,
         fingerPrintId: fingerPrintId,
         createdAt: this.fieldValue.serverTimestamp() as Timestamp,
         jobId: job.id,
         applicationSource: applicationSource,
         applied: false,
         appliedAt: null,
         userId: null,
         applicationSynchronized: false,
      }

      return this.firestore
         .collection("anonymousJobApplications")
         .doc(newAnonApplication.id)
         .set(newAnonApplication)
   }

   async confirmUserApplicationToCustomJob(
      user: UserData,
      jobId: string
   ): Promise<void> {
      const batch = this.firestore.batch()
      const applicationId = this.getJobApplicationId(jobId, user.userEmail)

      const jobApplicationRef = this.firestore
         .collection("jobApplications")
         .doc(applicationId)

      const jobStatsRef = this.firestore.collection("customJobStats").doc(jobId)

      const toUpdate: Pick<CustomJobApplicant, "applied" | "appliedAt"> = {
         applied: true,
         appliedAt: this.fieldValue.serverTimestamp() as Timestamp,
      }

      batch.update(jobApplicationRef, toUpdate)

      if (!user.userEmail.includes("@careerfairy")) {
         // we only want to increment the count if the user is not from CareerFairy
         batch.update(jobStatsRef, { applicants: this.fieldValue.increment(1) })
      }

      return batch.commit()
   }

   async confirmAnonymousUserApplicationToCustomJob(
      fingerPrintId: string,
      jobId: string
   ): Promise<void> {
      const batch = this.firestore.batch()
      const applicationId = this.getJobApplicationId(jobId, fingerPrintId)

      const ref = this.firestore
         .collection("anonymousJobApplications")
         .doc(applicationId)

      const toUpdate: Pick<AnonymousJobApplication, "applied" | "appliedAt"> = {
         applied: true,
         appliedAt: this.fieldValue.serverTimestamp() as Timestamp,
      }

      const jobStatsRef = this.firestore.collection("customJobStats").doc(jobId)

      batch.update(jobStatsRef, { applicants: this.fieldValue.increment(1) })
      batch.update(ref, toUpdate)

      return batch.commit()
   }

   async setRemovedUserCustomJobApplication(
      userId: string,
      jobId: string
   ): Promise<void> {
      const applicationId = this.getJobApplicationId(jobId, userId)

      const ref = this.firestore
         .collection("jobApplications")
         .doc(applicationId)

      const toUpdate: Pick<CustomJobApplicant, "removedFromUserProfile"> = {
         removedFromUserProfile: true,
      }

      return ref.update(toUpdate)
   }

   async incrementCustomJobClicks(jobId: string): Promise<void> {
      const ref = this.firestore.collection("customJobStats").doc(jobId)

      return ref.update({
         clicks: this.fieldValue.increment(1),
      })
   }

   async getCustomJobsByLivestreamId(
      livestreamId: string
   ): Promise<CustomJob[]> {
      const docs = await this.firestore
         .collection(this.COLLECTION_NAME)
         .where("livestreams", "array-contains", livestreamId)
         .get()

      if (docs.empty) {
         return []
      }

      return this.addIdToDocs<CustomJob>(docs.docs)
   }

   async updateCustomJobWithLinkedLivestreams(
      livestreamId: string,
      jobIdsToUpdate: string[],
      toRemove: boolean
   ): Promise<void> {
      const batch = this.firestore.batch()
      const jobsToUpdate = await this.getCustomJobByIds(jobIdsToUpdate)

      jobsToUpdate.forEach((job) => {
         const ref = this.firestore.collection(this.COLLECTION_NAME).doc(job.id)
         const jobIsNotExpired = job.deadline?.toDate() >= new Date()

         if (toRemove) {
            const amountOfLinkedContent =
               job.livestreams.length + job.sparks.length

            batch.update(ref, {
               livestreams: this.fieldValue.arrayRemove(livestreamId),
               // if there are more than 1 linked content it means that will continue to have linked content after this removal
               published: jobIsNotExpired && amountOfLinkedContent > 1,
            })
         } else {
            batch.update(ref, {
               livestreams: this.fieldValue.arrayUnion(livestreamId),
               published: jobIsNotExpired,
            })
         }
      })

      return batch.commit()
   }

   async syncPermanentlyExpiredCustomJobs(): Promise<void> {
      const customJobRef = this.firestore
         .collection(this.COLLECTION_NAME)
         .where("deadline", "<", getMaxDaysAfterDeadline())

      const snapshot = await customJobRef.get()
      const chunks = chunkArray(snapshot.docs, 450)

      const promises = chunks.map(async (chunk) => {
         const batch = this.firestore.batch()

         chunk.forEach((doc) => {
            batch.update(doc.ref, {
               isPermanentlyExpired: true,
            })
         })

         return batch.commit()
      })

      await Promise.allSettled(promises)
   }

   async syncExpiredCustomJobs(): Promise<void> {
      const customJobRef = this.firestore
         .collection(this.COLLECTION_NAME)
         .where("deadline", "<", new Date())

      const snapshot = await customJobRef.get()
      const chunks = chunkArray(snapshot.docs, 450)

      const promises = chunks.map(async (chunk) => {
         const batch = this.firestore.batch()

         chunk.forEach((doc) => {
            batch.update(doc.ref, {
               published: false,
            })
         })

         return batch.commit()
      })

      await Promise.allSettled(promises)
   }

   async getCustomJobsByGroupId(groupId: string): Promise<CustomJob[]> {
      const docs = await this.firestore
         .collection(this.COLLECTION_NAME)
         .where("groupId", "==", groupId)
         .where("isPermanentlyExpired", "==", false)
         .get()

      if (docs.empty) {
         return []
      }

      return this.addIdToDocs<CustomJob>(docs.docs)
   }

   async groupHasPublishedCustomJobs(groupId: string): Promise<boolean> {
      const snapshot = await this.firestore
         .collection(this.COLLECTION_NAME)
         .where("groupId", "==", groupId)
         .where("isPermanentlyExpired", "==", false)
         .where("deadline", ">=", new Date())
         .where("published", "==", true)
         .get()

      return (
         !snapshot.empty &&
         Boolean(
            mapFirestoreDocuments<CustomJob>(snapshot).find(
               (job) => !job.deleted
            )
         )
      )
   }

   async getCustomJobsByLinkedContentIds(
      linkField: keyof Pick<CustomJob, "sparks" | "livestreams">,
      ids: string[]
   ): Promise<CustomJob[]> {
      if (!ids.length) return []

      const chunks = chunkArray(ids, 10)
      const promises = []
      for (const chunk of chunks) {
         promises.push(
            this.firestore
               .collection(this.COLLECTION_NAME)
               .where(linkField, "array-contains-any", chunk)
               .get()
               .then(mapFirestoreDocuments)
         )
      }

      const responses = await Promise.allSettled(promises)

      return responses
         .filter((r) => {
            if (r.status === "fulfilled") {
               return true
            } else {
               // only log for debugging purposes
               console.error("Promise failed", r)
            }

            return false
         })
         .map((r) => (r as PromiseFulfilledResult<CustomJob[]>).value)
         .flat()
         .filter(Boolean)
   }

   async getGroupJobs(groupId: string): Promise<CustomJob[]> {
      const docs = await this.firestore
         .collection(this.COLLECTION_NAME)
         .where("groupId", "==", groupId)
         .where("deleted", "==", false)
         .where("published", "==", true)
         .where("deadline", ">=", new Date())
         .orderBy("deadline", "asc")
         .get()

      return this.addIdToDocs<CustomJob>(docs.docs)
   }
}
