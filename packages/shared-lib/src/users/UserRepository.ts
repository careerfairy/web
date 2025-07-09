import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { Application } from "../ats/Application"
import { Job, JobIdentifier, PUBLIC_JOB_STATUSES } from "../ats/Job"
import { Create } from "../commonTypes"
import {
   AnonymousJobApplication,
   CustomJob,
   CustomJobApplicant,
} from "../customJobs/customJobs"
import { FieldOfStudy } from "../fieldOfStudy"
import { Timestamp } from "../firebaseTypes"
import { Group, PublicGroup } from "../groups"
import { LivestreamEvent, pickPublicDataFromLivestream } from "../livestreams"
import { SeenSparks } from "../sparks/sparks"
import { chunkArray } from "../utils"
import { Logger } from "../utils/types"
import {
   CompanyFollowed,
   IUserReminder,
   ProfileLanguage,
   ProfileLink,
   RegisteredLivestreams,
   RegistrationStep,
   SavedRecruiter,
   StudyBackground,
   UserATSDocument,
   UserATSRelations,
   UserActivity,
   UserData,
   UserDataPersonalInfo,
   UserJobApplicationDocument,
   UserLastViewedJob,
   UserPublicData,
   UserReminderType,
   UserStats,
   ValidUserTagFields,
} from "./users"

export interface IUserRepository {
   updateUserData(userId: string, data: Partial<UserData>): Promise<void>
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

   getUsersDataByUuids(uuids: string[]): Promise<UserData[]>

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

   updateUserAnonymousJobApplications(
      userEmail: string,
      fingerPrintId: string
   ): Promise<void>

   migrateAnonymousJobApplications(userData: UserData): Promise<void>

   updateJobApplicationsUserData(userData: UserData): Promise<void>

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

   getUserStats(userEmail: string): Promise<UserStats>
   getCompaniesUserFollowsQuery(
      userEmail: string,
      limit: number
   ): firebase.firestore.Query<CompanyFollowed>

   getCompaniesUserFollows(
      userEmail: string,
      limit?: number
   ): Promise<CompanyFollowed[]>

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

   deleteResume(userEmail: string): Promise<void>

   welcomeDialogComplete(userEmail: string): Promise<void>

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

   getUserSeenSparks(userEmail: string): Promise<SeenSparks[]>

   getCustomJobApplications(
      userId: string,
      limit: number
   ): Promise<CustomJobApplicant[]>

   /**
    * Retrieves the registered live streams for a user
    * @param userEmail - The user email
    * @returns The registered live streams for the user
    */
   getUserRegisteredLivestreams(
      userEmail: string
   ): Promise<RegisteredLivestreams>

   /**
    * Retrieves all users where the tags match any values in @param tagIds. The field to be compared against is defined
    * by @param tagField.
    * @param tagField UserData property to filter the tags by.
    * @param tagIds Ids of the tags to use when filtering the @param tagField.
    */
   getUsersWithTags(
      tagField: ValidUserTagFields,
      tagIds: string[]
   ): Promise<UserData[]>

   /**
    * Creates a given study background in the /userData/studyBackgrounds sub collection.
    * @param userId Id of the user.
    * @param studyBackground Study background data.
    */
   createUserStudyBackground(
      userId: string,
      studyBackground: StudyBackground
   ): Promise<void>

   /**
    * Updates the given study background (@param studyBackground) for the user with id defined by @param userId.
    * @param userId Id of the user.
    * @param studyBackground Study background to be updated.
    */
   updateUserStudyBackground(
      userId: string,
      studyBackground: StudyBackground
   ): Promise<void>

   /**
    * Deletes the given study background by @param studyBackgroundId for user @param userId.
    * @param id Id of the user.
    * @param studyBackgroundId Id of the study background to delete.
    */
   deleteStudyBackground(
      userId: string,
      studyBackgroundId: string
   ): Promise<void>

   /**
    * Creates a new profile link for the user identified by @param userId, user links live in a sub collection of /userData.
    * @param userId Id of the user.
    * @param link Link data to be created.
    */
   createUserLink(userId: string, link: ProfileLink): Promise<void>

   /**
    * Updates a given profile link for the user identified by @param userId.
    * @param userId Id of the user.
    * @param link Link data to be updated.
    */
   updateUserLink(userId: string, link: ProfileLink): Promise<void>

   /**
    * Deletes a given link (@param linkId) for the user (@param userId).
    * @param userId User id.
    * @param linkId Link id.
    */
   deleteLink(userId: string, linkId: string): Promise<void>

   /**
    * Creates a new language for the user identified by @param userId, living in a sub collection of /userData.
    * @param userId Id of the user.
    * @param language Language to be created.
    */
   createLanguage(userId: string, language: ProfileLanguage): Promise<void>

   /**
    * Updates a given profile language for the user identified by @param userId.
    * @param userId Id of the user.
    * @param language Language to be updated.
    */
   updateLanguage(userId: string, language: ProfileLanguage): Promise<void>

   /**
    * Deletes a given language (@param languageId) for the user (@param userId).
    * @param userId User id.
    * @param languageId Language id.
    */
   deleteLanguage(userId: string, languageId: string): Promise<void>

   /**
    * Updates the /userData/companiesUserFollows sub collection for each user in @param followingUsers.
    * @param group The public group data.
    * @param followingUsers The users to update.
    */
   batchUpdateFollowingUsersGroup(
      group: PublicGroup,
      followingUsers: string[],
      logger?: Logger
   ): Promise<void>

   /**
    * Deletes the /userData/companiesUserFollows/{groupId} sub collection for each user in @param followingUsers.
    * @param groupId The group id.
    * @param followingUsers The users to delete.
    */
   batchDeleteFollowingUsersGroup(
      groupId: string,
      followingUsers: string[]
   ): Promise<void>

   /**
    * Updates the personal info for a user, updates only a subset of the user data fields.
    * @param userId Id of the user.
    * @param data Data to be updated.
    */
   updatePersonalInfo(userId: string, data: UserDataPersonalInfo): Promise<void>

   getUserStudyBackgrounds(userId: string): Promise<StudyBackground[]>

   getUserLanguages(userId: string): Promise<ProfileLanguage[]>

   getUsersByUniversity(
      countryId: string,
      universityCode: string
   ): Promise<UserData[]>

   updateUserLastViewedJob(job: CustomJob, userAuthId: string): Promise<void>

   getUserLastViewedJobs(
      userAuthId: string,
      limit: number
   ): Promise<UserLastViewedJob[]>

   getSavedJobs(userId: string, limit: number): Promise<CustomJob[]>
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

   async updateUserData(
      userId: string,
      data: Partial<UserData>
   ): Promise<void> {
      const userRef = this.firestore.collection("userData").doc(userId)

      return userRef.update(data)
   }

   async welcomeDialogComplete(userEmail: string) {
      const userRef = this.firestore.collection("userData").doc(userEmail)

      await userRef.update({
         welcomeDialogComplete: true,
      })
   }

   async getStats(userEmail: string): Promise<UserStats | null> {
      const snap = await this.firestore
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

   async incrementStat(userDataId: string, field: keyof UserStats, amount = 1) {
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
      const snap = await this.firestore
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
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         lastActivityAt: this.fieldValue.serverTimestamp() as any,
      }

      return this.firestore
         .collection("userData")
         .doc(userId)
         .set(toUpdate, { merge: true })
   }

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      const userRef = this.firestore.collection("userData").doc(userEmail)

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

   async getUsersDataByUuids(uuids: string[]): Promise<UserData[]> {
      const users = await Promise.all(
         uuids.map((uid) => this.getUserDataByUid(uid))
      )
      return users.filter((user) => user !== null)
   }

   async getUsersByEmail(
      arrayOfEmails = [],
      options = { withEmpty: false }
   ): Promise<UserData[]> {
      let totalUsers = []
      let i, j, tempArray
      const chunk = 800
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

   async getCustomJobApplications(
      userId: string,
      limit: number
   ): Promise<CustomJobApplicant[]> {
      const collectionRef = this.firestore
         .collection("jobApplications")
         .where("user.id", "==", userId)
         .orderBy("appliedAt", "desc")
         .limit(limit)

      const data = await collectionRef.get()

      return this.addIdToDocs<CustomJobApplicant>(data.docs)
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
         businessFunctionsTagIds,
         contentTopicsTagIds,
         phoneNumber,
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
      const businessFunctionsToUpdate = businessFunctionsTagIds
         ? { businessFunctionsTagIds }
         : {}
      const contentTopicsToUpdate = contentTopicsTagIds
         ? { contentTopicsTagIds }
         : {}
      const phoneNumberToUpdate = phoneNumber ? { phoneNumber } : {}

      // @ts-ignore
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
         ...businessFunctionsToUpdate,
         ...contentTopicsToUpdate,
         ...phoneNumberToUpdate,
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

   async updateUserAnonymousJobApplications(
      userEmail: string,
      fingerPrintId: string
   ): Promise<void> {
      const batch = this.firestore.batch()

      const ref = this.firestore
         .collection("anonymousJobApplications")
         .where("fingerPrintId", "==", fingerPrintId)
         .where("userId", "==", null)

      const snaps = await ref.get()

      // Update only user email
      snaps.forEach((snap) => {
         const updateData: Pick<AnonymousJobApplication, "userId"> = {
            userId: userEmail,
         }
         batch.update(snap.ref, updateData)
      })

      return batch.commit()
   }

   async migrateAnonymousJobApplications(userData: UserData): Promise<void> {
      if (!userData?.id) return

      const batch = this.firestore.batch()

      const ref = this.firestore
         .collection("anonymousJobApplications")
         .where("userId", "==", userData.id)
         .where("applicationSynchronized", "==", false)

      const snaps = await ref.get()

      for (let i = 0; snaps.size && i < snaps.docs.length; i++) {
         const anonymousApplicationData = snaps.docs
            .at(i)
            .data() as AnonymousJobApplication
         // Get the job which user anonymously applied to
         const jobRef = this.firestore
            .collection("customJobs")
            .doc(anonymousApplicationData.jobId)

         const customJob = (await jobRef.get()).data() as CustomJob

         const groupRef = this.firestore
            .collection("careerCenterData")
            .doc(customJob.groupId)

         const group = (await groupRef.get()).data() as Group

         const jobApplication: CustomJobApplicant = {
            id: `${customJob.id}_${userData.id}`,
            documentType: "customJobApplicant",
            jobId: customJob.id,
            user: userData,
            groupId: customJob.groupId,
            appliedAt: anonymousApplicationData.appliedAt || null,
            applicationSource: anonymousApplicationData.applicationSource,
            job: customJob,
            applied: anonymousApplicationData.applied,
            createdAt: anonymousApplicationData.createdAt,
            companyCountry: group.companyCountry?.id,
            companyIndustries:
               group.companyIndustries?.map((industry) => industry.id) || [],
            companySize: group.companySize,
         }

         const jobApplicationRef = this.firestore
            .collection("jobApplications")
            .doc(`${customJob.id}_${userData.id}`)

         batch.set(jobApplicationRef, jobApplication)

         const toUpdateAnonJobApplication: Pick<
            AnonymousJobApplication,
            "applicationSynchronized"
         > = {
            applicationSynchronized: true,
         }

         batch.update(snaps.docs.at(i).ref, toUpdateAnonJobApplication)
      }

      return batch.commit()
   }

   // updateJobApplicationsUserData
   async updateJobApplicationsUserData(userData: UserData): Promise<void> {
      const batch = this.firestore.batch()

      const ref = this.firestore
         .collection("jobApplications")
         .where("user.id", "==", userData.id)

      const snaps = await ref.get()

      for (let i = 0; snaps.size && i < snaps.docs.length; i++) {
         const toUpdateJobApplication: Pick<CustomJobApplicant, "user"> = {
            user: userData,
         }

         batch.update(snaps.docs.at(i).ref, toUpdateJobApplication)
      }

      return batch.commit()
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
   getUserStats(userEmail: string): Promise<UserStats> {
      const docRef = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("stats")
         .doc("stats")

      return docRef.get().then((value) => value.data() as unknown as UserStats)
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

   async getCompaniesUserFollows(
      userId: string,
      limit?: number
   ): Promise<CompanyFollowed[]> {
      let query = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("companiesUserFollows")
         .orderBy("createdAt", "desc")
         .withConverter(createCompatGenericConverter<CompanyFollowed>())

      if (limit) query = query.limit(limit)

      const snapshot = await query.get()
      return mapFirestoreDocuments<CompanyFollowed>(snapshot)
   }

   updateResume(userEmail: string, resumeUrl: string): Promise<void> {
      const docRef = this.firestore.collection("userData").doc(userEmail)

      const toUpdate: Pick<UserData, "userResume"> = {
         userResume: resumeUrl,
      }

      return docRef.update(toUpdate)
   }

   deleteResume(userEmail: string): Promise<void> {
      const docRef = this.firestore.collection("userData").doc(userEmail)

      const toUpdate = {
         userResume: firebase.firestore.FieldValue.delete(),
      }

      return docRef.update(toUpdate)
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

   async getUserSeenSparks(userEmail: string): Promise<SeenSparks[]> {
      const query = this.firestore
         .collection("userData")
         .doc(userEmail)
         .collection("seenSparks")
         .where("userId", "==", userEmail)

      const dataSnapshot = await query.get()

      const sortedSeenSparks = mapFirestoreDocuments<SeenSparks>(
         dataSnapshot
      )?.sort(
         (baseDoc, comparisonDoc) =>
            Number(comparisonDoc.id) - Number(baseDoc.id)
      )

      return sortedSeenSparks
   }

   async getUserRegisteredLivestreams(
      userEmail: string
   ): Promise<RegisteredLivestreams> {
      const docRef = this.firestore
         .collection("registeredLivestreams")
         .where("user.userEmail", "==", userEmail)
         .withConverter(createCompatGenericConverter<RegisteredLivestreams>())

      const snap = await docRef.get()

      if (snap.empty) {
         return null
      }

      return snap.docs[0].data()
   }

   async getUsersWithTags(
      tagField: ValidUserTagFields,
      tagIds: string[],
      lastVisibleDoc?: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData> // Used for pagination
   ): Promise<UserData[]> {
      const DOCUMENTS_LIMIT = 1000
      if (!tagIds?.length) return []

      let query = this.firestore
         .collection("userData")
         .where(tagField, "array-contains-any", tagIds)
         .limit(DOCUMENTS_LIMIT)

      if (lastVisibleDoc) {
         // If we're paginating, start the query after the last document
         query = query.startAfter(lastVisibleDoc)
      }

      const data = await query.get()

      // Get the last document for pagination
      const lastVisible = data.docs[data.docs.length - 1]

      // Recursive call if there are more documents to fetch
      if (data.docs.length === DOCUMENTS_LIMIT) {
         const nextPage = await this.getUsersWithTags(
            tagField,
            tagIds,
            lastVisible
         )
         return [...this.addIdToDocs<UserData>(data.docs), ...nextPage]
      }

      return this.addIdToDocs<UserData>(data.docs)
   }

   async createUserStudyBackground(
      userId: string,
      studyBackground: StudyBackground
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("studyBackgrounds")
         .doc()

      const data: StudyBackground = {
         ...studyBackground,
         id: ref.id,
      }

      await ref.set(data)
   }

   async updateUserStudyBackground(
      userId: string,
      studyBackground: StudyBackground
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("studyBackgrounds")
         .doc(studyBackground.id)

      return ref.set(studyBackground)
   }

   async deleteStudyBackground(
      userId: string,
      studyBackgroundId: string
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("studyBackgrounds")
         .doc(studyBackgroundId)

      return ref.delete()
   }

   async getUserStudyBackgrounds(userId: string): Promise<StudyBackground[]> {
      const querySnapshot = await this.firestore
         .collection("userData")
         .doc(userId)
         .collection("studyBackgrounds")
         .get()

      return querySnapshot.empty
         ? []
         : querySnapshot.docs.map((doc) => doc.data() as StudyBackground)
   }

   async getUserLanguages(userId: string): Promise<ProfileLanguage[]> {
      const querySnapshot = await this.firestore
         .collection("userData")
         .doc(userId)
         .collection("languages")
         .get()

      return querySnapshot.empty
         ? []
         : querySnapshot.docs.map((doc) => doc.data() as ProfileLanguage)
   }

   async getUsersByUniversity(
      countryId: string,
      universityCode: string
   ): Promise<UserData[]> {
      const snapshot = await this.firestore
         .collection("userData")
         .where("universityCountryCode", "==", countryId)
         .where("university.code", "==", universityCode)
         .get()

      return mapFirestoreDocuments<UserData>(snapshot)
   }

   async updateUserLastViewedJob(
      job: CustomJob,
      userAuthId: string
   ): Promise<void> {
      const ref = this.firestore
         .collection("seenJobs")
         .doc(`${userAuthId}_${job.id}`)

      await ref.set(
         {
            id: `${userAuthId}_${job.id}`,
            userAuthId,
            job,
            totalViews: this.fieldValue.increment(1),
            lastViewedAt: this.timestamp.now(),
         },
         { merge: true }
      )
   }

   async getUserLastViewedJobs(
      userAuthId: string,
      limit: number
   ): Promise<UserLastViewedJob[]> {
      const query = this.firestore
         .collection("seenJobs")
         .where("userAuthId", "==", userAuthId)
         .orderBy("totalViews", "desc")
         .orderBy("lastViewedAt", "desc")
         .limit(limit)

      const dataSnapshot = await query.get()
      return mapFirestoreDocuments<UserLastViewedJob>(dataSnapshot)
   }

   async getSavedJobs(userId: string, limit = 10): Promise<CustomJob[]> {
      const query = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("savedJobs")
         .orderBy("deadline", "desc")
         .limit(limit)

      const dataSnapshot = await query.get()
      return mapFirestoreDocuments<CustomJob>(dataSnapshot)
   }

   async createUserLink(userId: string, link: ProfileLink): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("links")
         .doc()

      const data: ProfileLink = {
         ...link,
         id: ref.id,
      }

      await ref.set(data)
   }

   async updateUserLink(userId: string, link: ProfileLink): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("links")
         .doc(link.id)

      return ref.set(link)
   }

   async deleteLink(userId: string, linkId: string): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("links")
         .doc(linkId)

      return ref.delete()
   }

   async createLanguage(
      userId: string,
      language: ProfileLanguage
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("languages")
         .doc(language.languageId)

      const data: ProfileLanguage = {
         ...language,
         id: ref.id,
      }

      await ref.set(data)
   }

   async updateLanguage(
      userId: string,
      language: ProfileLanguage
   ): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("languages")
         .doc(language.id)

      return ref.set(language)
   }

   async deleteLanguage(userId: string, languageId: string): Promise<void> {
      const ref = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("languages")
         .doc(languageId)

      return ref.delete()
   }

   async batchUpdateFollowingUsersGroup(
      group: PublicGroup,
      followingUsers: string[],
      logger?: Logger
   ): Promise<void> {
      if (!followingUsers?.length) return

      const BATCH_SIZE = 300

      const chunks = chunkArray(followingUsers, BATCH_SIZE)

      for (const chunk of chunks) {
         const batch = this.firestore.batch()

         for (const userId of chunk) {
            const ref = this.firestore
               .collection("userData")
               .doc(userId)
               .collection("companiesUserFollows")
               .doc(group.id)

            const toUpdatePublicGroup: Pick<CompanyFollowed, "group"> = {
               group: group,
            }

            const snap = await ref.get()
            if (!snap.exists) {
               logger.warn(
                  `Company followed ${group.id} for user ${userId} does not exist, skipping update`
               )
               continue
            }

            batch.update(ref, toUpdatePublicGroup)
         }

         await batch.commit()
      }
   }

   async batchDeleteFollowingUsersGroup(
      groupId: string,
      followingUsers: string[]
   ): Promise<void> {
      if (!followingUsers?.length) return

      const BATCH_SIZE = 300
      const chunks = chunkArray(followingUsers, BATCH_SIZE)

      for (const chunk of chunks) {
         const batch = this.firestore.batch()

         for (const userId of chunk) {
            const ref = this.firestore
               .collection("userData")
               .doc(userId)
               .collection("companiesUserFollows")
               .doc(groupId)
            batch.delete(ref)
         }

         await batch.commit()
      }
   }

   async updatePersonalInfo(
      userId: string,
      personalInfo: UserDataPersonalInfo
   ): Promise<void> {
      const ref = this.firestore.collection("userData").doc(userId)

      // Email explicitly excluded from update for now
      const toUpdate: Pick<
         UserData,
         | "firstName"
         | "lastName"
         | "countryIsoCode"
         | "stateIsoCode"
         | "stateName"
      > = {
         ...personalInfo,
      }

      return ref.update(toUpdate)
   }
}

const documentIdJobApplication = (jobIdentifier: JobIdentifier) => {
   return `${jobIdentifier.groupId}_${jobIdentifier.integrationId}_${jobIdentifier.jobId}`
}
