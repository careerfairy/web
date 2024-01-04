import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import {
   CompanyFollowed,
   IUserReminder,
   RegistrationStep,
   SavedRecruiter,
   UserActivity,
   UserATSDocument,
   UserATSRelations,
   UserCustomJobApplicationDocument,
   UserData,
   UserJobApplicationDocument,
   UserPublicData,
   UserReminderType,
   UserStats,
} from "./users"
import firebase from "firebase/compat/app"
import { Job, JobIdentifier, PUBLIC_JOB_STATUSES } from "../ats/Job"
import { LivestreamEvent, pickPublicDataFromLivestream } from "../livestreams"
import { Application } from "../ats/Application"
import { FieldOfStudy } from "../fieldOfStudy"
import { Create } from "../commonTypes"
import {
   CustomJob,
   pickPublicDataFromCustomJob,
} from "../customJobs/customJobs"
import { Timestamp } from "../firebaseTypes"

export interface IUserRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>
   updateFieldOfStudy(
      userEmail: string,
      fieldOfStudy: FieldOfStudy
   ): Promise<void>
   updateLevelOfStudy(
      userEmail: string,
      levelOfStudy: FieldOfStudy
   ): Promise<void>

   getSavedRecruiters(userEmail: string): Promise<SavedRecruiter[]>

   saveRecruiter(userEmail: string, recruiter: SavedRecruiter): Promise<void>

   getSavedRecruiter(userEmail: string, id: string): Promise<SavedRecruiter>

   removeSavedRecruiter(userEmail: string, recruiterId: string): Promise<void>

   getUserDataByUid(uid: string): Promise<UserData>

   getUserDataById(id: string): Promise<UserData>

   getUsersDataByUids(uids: string[]): Promise<UserData[]>

   getUsersByEmail(
      arrayOfEmails: string[],
      options?: { withEmpty: boolean }
   ): Promise<UserData[]>

   getUserATSData(id: string): Promise<UserATSDocument>

   /**
    * Save/update the job application
    *
    * @param userId
    * @param jobIdentifier
    * @param job
    * @param livestream
    */
   upsertJobApplication(
      userId: string,
      jobIdentifier: JobIdentifier,
      job: Job,
      livestream: LivestreamEvent
   ): Promise<void>

   getJobApplications(userId: string): Promise<UserJobApplicationDocument[]>

   /**
    * Updates the user's the job applications in a batch operation
    *
    * @param userId
    * @param batchOperations
    */
   batchUpdateUserJobApplications(
      userId: string,
      batchOperations: {
         application: Application
         jobApplicationDocId: string
      }[]
   ): Promise<void>

   associateATSData(
      id: string,
      accountId: string,
      data: Partial<UserATSRelations>
   ): Promise<void>

   updateAdditionalInformation(
      userEmail: string,
      fields: Partial<UserData>
   ): Promise<void>

   setRegistrationStepStatus(
      userEmail: string,
      stepId: string,
      totalSteps: number
   ): Promise<void>

   updateUserReminder(
      userEmail: string,
      notification: IUserReminder
   ): Promise<void>

   getUserReminders(userEmail: string): Promise<IUserReminder[]>

   getUserReminder(
      userEmail: string,
      reminderIdentifier: UserReminderType
   ): Promise<IUserReminder>

   removeUserReminder(
      userEmail: string,
      reminderIdentifier: UserReminderType
   ): Promise<void>

   unsubscribeUser(userEmail: string): Promise<void>

   updateUserHasRegisteredToAnyLivestreamEver(
      userEmail: string,
      hasRegistered: boolean
   ): Promise<void>

   getCompaniesUserFollowsQuery(
      userEmail: string,
      limit: number
   ): firebase.firestore.Query<CompanyFollowed>

   /**
    * Creates a user activity document and updates his lastActivityAt field
    */
   createActivity(
      user: UserPublicData,
      type: UserActivity["type"],
      shouldUpdateLastActivity?: boolean
   ): Promise<void>

   updateLastActivity(userId: string): Promise<void>

   getByReferralCode(referralCode: string): Promise<UserData | null>

   incrementStat(
      userDataId: string,
      field: keyof UserStats,
      amount?: number
   ): Promise<void>

   addToStatArray(
      userDataId: string,
      field: keyof UserStats,
      value: string
   ): Promise<void>

   getStats(userDataId: string): Promise<UserStats>

   updateResume(userEmail: string, resumeUrl: string): Promise<void>

   welcomeDialogComplete(userEmail: string): Promise<void>

   /**
    * Adds the custom job public info on the jobApplications sub collection from the User document
    * @param userEmail
    * @param job
    */
   applyUserToCustomJob(userEmail: string, job: CustomJob): Promise<void>

   /**
    * Gets the user custom job application by jobId
    * @param userEmail
    * @param jobId
    */
   getCustomJobApplication(
      userEmail: string,
      jobId: string
   ): Promise<UserCustomJobApplicationDocument>

   /**
    * Deletes all the user notifications
    * @param userEmail
    */
   deleteAllUserNotifications(userEmail: string): Promise<void>

   /**
    * Should update the isRead flag to a specific user notification
    * @param userEmail
    * @param notificationId
    */
   markUserNotificationAsRead(
      userEmail: string,
      notificationId: string
   ): Promise<void>
}

export class FirebaseUserRepository
   extends BaseFirebaseRepository
   implements IUserRepository
{
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue,
      readonly timestamp: typeof firebase.firestore.Timestamp
   ) {
      super()
   }

   async welcomeDialogComplete(userEmail: string) {
      const userRef = this.firestore.collection("userData").doc(userEmail)

      await userRef.update({
         welcomeDialogComplete: true,
      })
   }

   async getStats(userEmail: string): Promise<UserStats | null> {
      let snap = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("stats")
         .doc("stats")
         .get()

      if (!snap.exists) {
         return null
      }

      return snap.data() as UserStats
   }

   async incrementStat(
      userDataId: string,
      field: keyof UserStats,
      amount: number = 1
   ) {
      const docRef = this.firestore
         .collection("userData")
         .doc(userDataId)
         .collection("stats")
         .doc("stats")

      return docRef.set(
         {
            userId: userDataId,
            [field]: this.fieldValue.increment(amount),
         },
         { merge: true }
      )
   }

   async addToStatArray(
      userDataId: string,
      field: keyof UserStats,
      value: string
   ) {
      const docRef = this.firestore
         .collection("userData")
         .doc(userDataId)
         .collection("stats")
         .doc("stats")

      return docRef.set(
         {
            userId: userDataId,
            [field]: this.fieldValue.arrayUnion(value),
         },
         { merge: true }
      )
   }

   async getByReferralCode(referralCode: string): Promise<UserData | null> {
      let snap = await this.firestore
         .collection("userData")
         .where("referralCode", "==", referralCode)
         .limit(1)
         .withConverter(createCompatGenericConverter<UserData>())
         .get()

      if (snap.empty) {
         return null
      }

      return snap.docs[0].data()
   }

   async createActivity(
      user: UserPublicData,
      type: UserActivity["type"],
      shouldUpdateLastActivity = true
   ): Promise<void> {
      const activityDoc: Create<UserActivity> = {
         collection: "userActivity",
         userId: user.id,
         type,
         date: this.fieldValue.serverTimestamp() as any,
         user,
      }

      const promises: Promise<unknown>[] = [
         // new activity entry
         this.firestore
            .collection("userData")
            .doc(user.id)
            .collection("activities")
            .add(activityDoc),
      ]

      if (shouldUpdateLastActivity) {
         // keep the userData lastActivityAt field up to date
         promises.push(this.updateLastActivity(user.id))
      }

      await Promise.all(promises)
   }

   updateLastActivity(userId: string): Promise<void> {
      const toUpdate: Pick<UserData, "lastActivityAt"> = {
         lastActivityAt: this.fieldValue.serverTimestamp() as any,
      }

      return this.firestore
         .collection("userData")
         .doc(userId)
         .set(toUpdate, { merge: true })
   }

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      let userRef = this.firestore.collection("userData").doc(userEmail)

      return userRef.update({
         interestsIds: Array.from(new Set(interestIds)),
      })
   }

   updateFieldOfStudy(
      userEmail: string,
      fieldOfStudy: FieldOfStudy
   ): Promise<void> {
      return this.firestore
         .collection("userData")
         .doc(userEmail)
         .update({ fieldOfStudy })
   }
   updateLevelOfStudy(
      userEmail: string,
      levelOfStudy: FieldOfStudy
   ): Promise<void> {
      return this.firestore
         .collection("userData")
         .doc(userEmail)
         .update({ levelOfStudy })
   }

   /*
  |--------------------------------------------------------------------------
  | Saved Recruiters
  |--------------------------------------------------------------------------
  */
   async getSavedRecruiter(
      userEmail: string,
      id: string
   ): Promise<SavedRecruiter> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("savedRecruiters")
         .doc(id)

      const doc = await ref.get()

      if (doc.exists) {
         return this.addIdToDoc<SavedRecruiter>(doc)
      }

      return null
   }

   async getSavedRecruiters(userEmail: string): Promise<SavedRecruiter[]> {
      const collectionRef = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("savedRecruiters")

      const data = await collectionRef.get()

      return this.addIdToDocs<SavedRecruiter>(data.docs)
   }

   async saveRecruiter(
      userEmail: string,
      recruiter: SavedRecruiter
   ): Promise<void> {
      // @ts-ignore
      recruiter.savedAt = this.fieldValue.serverTimestamp()

      return this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("savedRecruiters")
         .doc(recruiter.id)
         .set(recruiter)
   }

   removeSavedRecruiter(userEmail: string, recruiterId: string): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("savedRecruiters")
         .doc(recruiterId)

      return ref.delete()
   }

   async getUserDataByUid(uid: string): Promise<UserData> {
      const snap = await this.firestore
         .collection("userData")
         .where("authId", "==", uid)
         .limit(1)
         .get()

      if (snap.empty) return null
      return { ...snap.docs[0].data(), id: snap.docs[0].id } as UserData
   }

   async getUserDataById(id: string): Promise<UserData> {
      const snap = await this.firestore.collection("userData").doc(id).get()

      if (!snap.exists) return null

      return this.addIdToDoc<UserData>(snap)
   }

   async getUsersDataByUids(uids: string[]): Promise<UserData[]> {
      const users = await Promise.all(
         uids.map((uid) => this.getUserDataByUid(uid))
      )
      return users.filter((user) => user !== null)
   }

   async getUsersByEmail(
      arrayOfEmails = [],
      options = { withEmpty: false }
   ): Promise<UserData[]> {
      let totalUsers = []
      let i,
         j,
         tempArray,
         chunk = 800
      for (i = 0, j = arrayOfEmails.length; i < j; i += chunk) {
         tempArray = arrayOfEmails.slice(i, i + chunk)
         const userSnaps = await Promise.all(
            tempArray
               .filter((email) => email)
               .map((email) =>
                  this.firestore.collection("userData").doc(email).get()
               )
         )
         let newUsers
         if (options.withEmpty) {
            newUsers = userSnaps.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))
         } else {
            newUsers = userSnaps
               .filter((doc) => doc.exists)
               .map((doc) => ({ id: doc.id, ...doc.data() }))
         }
         totalUsers = [...totalUsers, ...newUsers]
      }
      return totalUsers
   }

   async getUserATSData(id: string): Promise<UserATSDocument> {
      const ref = this.firestore
         .collection("userData")
         .doc(id)
         .collection("atsRelations")
         .doc("atsRelations")

      const doc = await ref.get()

      if (!doc.exists) {
         return null
      }

      return doc.data() as UserATSDocument
   }

   /**
    * Update ats/ats sub document
    *
    * @param id
    * @param accountId
    * @param data
    */
   associateATSData(
      id: string,
      accountId: string,
      data: Partial<UserATSRelations>
   ): Promise<void> {
      const userRef = this.firestore
         .collection("userData")
         .doc(id)
         .collection("atsRelations")
         .doc("atsRelations")

      const toUpdate: Partial<UserATSDocument> = {
         userId: id,
         atsRelations: {
            [accountId]: data,
         },
      }

      return userRef.set(toUpdate, { merge: true })
   }

   batchUpdateUserJobApplications(
      userId: string,
      batchOperations: {
         application: Application
         jobApplicationDocId: string
      }[]
   ): Promise<void> {
      const batch = this.firestore.batch()
      batchOperations.forEach((operation) => {
         const ref = this.firestore
            .collection("userData")
            .doc(userId)
            .collection("jobApplications")
            .doc(operation.jobApplicationDocId)

         const toUpdate: Partial<UserJobApplicationDocument> = {
            rejectReason: operation.application.rejectReason || null,
            currentStage: operation.application.currentStage || null,
            // @ts-ignore
            updatedAt: this.fieldValue.serverTimestamp(),
            rejectedAt: operation.application.rejectedAt
               ? this.timestamp.fromDate(operation.application.rejectedAt)
               : null,
            job: operation.application.job.serializeToPlainObject() as Job,
         }
         batch.update(ref, toUpdate)
      })
      return batch.commit()
   }

   upsertJobApplication(
      userId: string,
      jobIdentifier: JobIdentifier,
      job: Job,
      livestream: LivestreamEvent
   ): Promise<void> {
      const docId = documentIdJobApplication(jobIdentifier)

      const docRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("jobApplications")
         .doc(docId)

      const toInsert: UserJobApplicationDocument = {
         groupId: jobIdentifier.groupId,
         integrationId: jobIdentifier.integrationId,
         jobId: jobIdentifier.jobId,
         // @ts-ignore
         date: this.fieldValue.serverTimestamp(),
         job: job.serializeToPlainObject() as Job,
         livestream: pickPublicDataFromLivestream(livestream),
         updatedAt: null,
      }

      return docRef.set(toInsert, { merge: true })
   }

   async getJobApplications(
      userId: string
   ): Promise<UserJobApplicationDocument[]> {
      const collectionRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("jobApplications")
         .where("job.status", "in", PUBLIC_JOB_STATUSES)
         .orderBy("date", "desc")

      const data = await collectionRef.get()

      return this.addIdToDocs<UserJobApplicationDocument>(data.docs)
   }

   updateAdditionalInformation(userEmail, fields): Promise<void> {
      const userRef = this.firestore.collection("userData").doc(userEmail)

      const {
         gender,
         spokenLanguages,
         countriesOfInterest,
         regionsOfInterest,
         isLookingForJob,
         interestsIds,
         linkedinUrl,
         referredBy,
         fieldOfStudy,
         unsubscribed,
         avatar,
         position,
         firstName,
         lastName,
      } = fields

      const genderToUpdate = gender ? { gender } : {}
      const interestsToUpdate = interestsIds ? { interestsIds } : {}
      const spokenLanguagesToUpdate = spokenLanguages ? { spokenLanguages } : {}
      const countriesOfInterestToUpdate = countriesOfInterest
         ? { countriesOfInterest }
         : {}
      const regionsOfInterestToUpdate = regionsOfInterest
         ? { regionsOfInterest }
         : {}
      const isLookingForJobToUpdate =
         isLookingForJob !== undefined ? { isLookingForJob } : {}
      const linkedInLinkToUpdate =
         linkedinUrl !== undefined ? { linkedinUrl } : {}
      const referredByToUpdate = referredBy !== undefined ? { referredBy } : {}
      const fieldOfStudyToUpdate =
         fieldOfStudy !== undefined ? { fieldOfStudy } : {}
      const unsubscribedToUpdate =
         unsubscribed !== undefined ? { unsubscribed } : {}
      const avatarToUpdate = avatar ? { avatar } : {}
      const positionToUpdate = position ? { position } : {}
      const firstNameToUpdate = firstName ? { firstName } : {}
      const lastNameToUpdate = lastName ? { lastName } : {}

      const toUpdate = {
         ...genderToUpdate,
         ...spokenLanguagesToUpdate,
         ...countriesOfInterestToUpdate,
         ...regionsOfInterestToUpdate,
         ...isLookingForJobToUpdate,
         ...interestsToUpdate,
         ...linkedInLinkToUpdate,
         ...referredByToUpdate,
         ...fieldOfStudyToUpdate,
         ...unsubscribedToUpdate,
         ...avatarToUpdate,
         ...positionToUpdate,
         ...firstNameToUpdate,
         ...lastNameToUpdate,
      }

      return userRef.update(toUpdate)
   }

   async setRegistrationStepStatus(
      userEmail,
      stepId,
      totalSteps
   ): Promise<void> {
      const userRef = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("analytics")
         .doc("analytics")

      // create base step analytics structure
      const stepAnalytics = {
         userId: userEmail,
         totalSteps,
         updatedAt: this.fieldValue.serverTimestamp(),
      } as RegistrationStep

      const toUpdate = {
         registrationSteps: {
            ...stepAnalytics,
            // adding stepIds with arrayUnion in order to not repeat them
            steps: this.fieldValue.arrayUnion(stepId),
         },
      }
      return userRef.set(toUpdate, { merge: true })
   }

   async unsubscribeUser(userEmail: string): Promise<void> {
      const userRef = this.firestore.collection("userData").doc(userEmail)

      const toUpdate: Pick<UserData, "unsubscribed"> = {
         unsubscribed: true,
      }

      return userRef.update(toUpdate)
   }

   async updateUserReminder(userEmail, notification): Promise<void> {
      return this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userReminders")
         .doc(notification.type)
         .set(notification, { merge: true })
   }

   async getUserReminders(userEmail): Promise<IUserReminder[]> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userReminders")
         .where("notBeforeThan", "<=", new Date())
         .where("complete", "==", false)
         .orderBy("notBeforeThan", "asc")

      const data = await ref.get()

      return data.docs.map((doc) => doc.data() as IUserReminder)
   }

   async getUserReminder(
      userEmail,
      reminderIdentifier
   ): Promise<IUserReminder> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userReminders")
         .doc(reminderIdentifier)

      const data = await ref.get()

      return data.data() as IUserReminder
   }

   removeUserReminder(userEmail, reminderIdentifier): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userReminders")
         .doc(reminderIdentifier)

      return ref.delete()
   }

   updateUserHasRegisteredToAnyLivestreamEver(
      userEmail,
      hasRegistered
   ): Promise<void> {
      const docRef = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("stats")
         .doc("stats")

      return docRef.set(
         {
            userId: userEmail,
            hasRegisteredOnAnyLivestream: hasRegistered,
         },
         { merge: true }
      )
   }

   getCompaniesUserFollowsQuery(
      userEmail: string,
      limit: number
   ): firebase.firestore.Query<CompanyFollowed> {
      return this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("companiesUserFollows")
         .withConverter(createCompatGenericConverter<CompanyFollowed>())
         .limit(limit)
   }

   updateResume(userEmail: string, resumeUrl: string): Promise<void> {
      const docRef = this.firestore.collection("userData").doc(userEmail)

      const toUpdate: Pick<UserData, "userResume"> = {
         userResume: resumeUrl,
      }

      return docRef.update(toUpdate)
   }

   async applyUserToCustomJob(
      userEmail: string,
      job: CustomJob
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("customJobApplications")
         .doc(job.id)

      const jobToApply: UserCustomJobApplicationDocument = {
         date: this.fieldValue.serverTimestamp() as Timestamp,
         job: pickPublicDataFromCustomJob(job),
         id: job.id,
      }

      return ref.set(jobToApply, { merge: true })
   }

   async getCustomJobApplication(
      userEmail: string,
      jobId: string
   ): Promise<UserCustomJobApplicationDocument> {
      const snap = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("customJobApplications")
         .doc(jobId)
         .get()

      if (snap.exists) {
         return this.addIdToDoc<UserCustomJobApplicationDocument>(snap)
      }
      return null
   }

   async deleteAllUserNotifications(userEmail: string): Promise<void> {
      const batch = this.firestore.batch()

      const snaps = await this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userNotifications")
         .get()

      snaps.forEach((snap) => {
         batch.delete(snap.ref)
      })

      return batch.commit()
   }

   async markUserNotificationAsRead(
      userEmail: string,
      notificationId: string
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("userNotifications")
         .doc(notificationId)

      return ref.update({
         readAt: this.fieldValue.serverTimestamp() as Timestamp,
      })
   }
}

const documentIdJobApplication = (jobIdentifier: JobIdentifier) => {
   return `${jobIdentifier.groupId}_${jobIdentifier.integrationId}_${jobIdentifier.jobId}`
}
