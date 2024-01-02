import { UserData } from "../users"
import { CustomJob, CustomJobApplicant, PublicCustomJob } from "./customJobs"
import BaseFirebaseRepository from "../BaseFirebaseRepository"
import firebase from "firebase/compat"
import { Timestamp } from "../firebaseTypes"

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
   updateCustomJob(job: PublicCustomJob): Promise<void>

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
    * To get a custom job application by user and job id from the jobApplications root collection
    * @param userId
    * @param jobId
    */
   getUserJobApplication(userId: string, jobId: string): Promise<CustomJob>

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
      livestreamId: string
   ): Promise<void>

   /**
    * To increment the 'clicks' field on a specific customJob
    * @param jobId
    * @param groupId
    */
   incrementCustomJobClicks(jobId: string, groupId: string): Promise<void>

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

   async createCustomJob(
      job: PublicCustomJob,
      linkedLivestreamId: string
   ): Promise<CustomJob> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc()

      const newJob: CustomJob = {
         documentType: this.COLLECTION_NAME,
         ...job,
         createdAt: this.fieldValue.serverTimestamp() as Timestamp,
         updatedAt: this.fieldValue.serverTimestamp() as Timestamp,
         livestreams: linkedLivestreamId ? [linkedLivestreamId] : [],
         id: ref.id,
      }

      await ref.set(newJob, { merge: true })

      return newJob
   }

   async updateCustomJob(job: CustomJob): Promise<void> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(job.id)

      const updatedJob: CustomJob = {
         ...job,
         updatedAt: this.fieldValue.serverTimestamp() as Timestamp,
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

   async applyUserToCustomJob(
      user: UserData,
      job: CustomJob,
      livestreamId: string
   ): Promise<void> {
      const batch = this.firestore.batch()
      const applicationId = `${job.id}_${user.userEmail}`
      const jobStatsId = `${job.groupId}_${job.id}`

      const jobApplicationRef = this.firestore
         .collection("jobApplications")
         .doc(applicationId)

      const jobStatsRef = this.firestore
         .collection("customJobStats")
         .doc(jobStatsId)

      const newJobApplicant: CustomJobApplicant = {
         documentType: "customJobApplicant",
         id: applicationId,
         jobId: job.id,
         groupId: job.groupId,
         livestreamId: livestreamId,
         appliedAt: this.fieldValue.serverTimestamp() as Timestamp,
         user,
         job,
      }

      batch.set(jobApplicationRef, newJobApplicant, { merge: true })

      if (!user.userEmail.includes("@careerfairy")) {
         // we only want to increment the count if the user is not from CareerFairy
         batch.update(jobStatsRef, { applicants: this.fieldValue.increment(1) })
      }

      return batch.commit()
   }

   async incrementCustomJobClicks(
      jobId: string,
      groupId: string
   ): Promise<void> {
      const jobStatsId = `${groupId}_${jobId}`

      const ref = this.firestore.collection("customJobStats").doc(jobStatsId)

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

      jobIdsToUpdate.forEach((jobId) => {
         const ref = this.firestore.collection(this.COLLECTION_NAME).doc(jobId)

         if (toRemove) {
            batch.update(ref, {
               livestreams: this.fieldValue.arrayRemove(livestreamId),
            })
         } else {
            batch.update(ref, {
               livestreams: this.fieldValue.arrayUnion(livestreamId),
            })
         }
      })

      return batch.commit()
   }
}
