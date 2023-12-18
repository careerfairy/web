import { UserData } from "../users"
import { CustomJob, CustomJobApplicants, PublicCustomJob } from "./customJobs"
import BaseFirebaseRepository from "../BaseFirebaseRepository"
import firebase from "firebase/compat"
import { Timestamp } from "../firebaseTypes"

export interface ICustomJobRepository {
   /**
    * To create a custom job as sub collection of the group document
    * @param job
    */
   createCustomJob(job: PublicCustomJob): Promise<CustomJob>

   /**
    * To update an existing custom job on the sub collection of the group document
    * @param job
    */
   updateCustomJob(job: PublicCustomJob): Promise<void>

   /**
    * To delete a custom job on the sub collection of the group document
    * @param jobId
    */
   deleteCustomJob(jobId: string): Promise<void>

   /**
    * To get a custom job by id on the sub collection of the group document
    * @param jobId
    */
   getCustomJobById(jobId: string): Promise<CustomJob>

   /**
    * To create or update an existing jobApplication with a new applicant
    * Increase the applicants field on the corresponding jobStats document
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

   async createCustomJob(job: PublicCustomJob): Promise<CustomJob> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc()

      const newJob: CustomJob = {
         documentType: this.COLLECTION_NAME,
         ...job,
         createdAt: this.fieldValue.serverTimestamp() as Timestamp,
         updatedAt: this.fieldValue.serverTimestamp() as Timestamp,
         livestreams: [],
         id: ref.id,
      }

      await ref.set(newJob, { merge: true })

      return newJob
   }

   async updateCustomJob(job: PublicCustomJob): Promise<void> {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(job.id)

      const updatedJob: Partial<CustomJob> = {
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

      const newJobApplicant: CustomJobApplicants = {
         documentType: "customJobApplicant",
         jobId: job.id,
         user,
         id: applicationId,
         appliedAt: this.fieldValue.serverTimestamp() as Timestamp,
         groupId: job.groupId,
         livestreamId: livestreamId,
      }

      batch.set(jobApplicationRef, newJobApplicant, { merge: true })
      batch.update(jobStatsRef, { applicants: this.fieldValue.increment(1) })

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
}
