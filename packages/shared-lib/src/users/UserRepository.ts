import BaseFirebaseRepository from "../BaseFirebaseRepository"
import {
   RegistrationStep,
   SavedRecruiter,
   UserATSDocument,
   UserATSRelations,
   UserData,
   UserJobApplicationDocument,
} from "./users"
import firebase from "firebase/compat/app"
import { Job, JobIdentifier } from "../ats/Job"
import { LivestreamEvent, pickPublicDataFromLivestream } from "../livestreams"

export interface IUserRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>

   getSavedRecruiters(userEmail: string): Promise<SavedRecruiter[]>

   saveRecruiter(userEmail: string, recruiter: SavedRecruiter): Promise<void>

   getSavedRecruiter(userEmail: string, id: string): Promise<SavedRecruiter>

   removeSavedRecruiter(userEmail: string, recruiterId: string): Promise<void>

   getUserDataByUid(uid: string): Promise<UserData>

   getUserDataById(id: string): Promise<UserData>

   getUsersDataByUids(uids: string[]): Promise<UserData[]>

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
}

export class FirebaseUserRepository
   extends BaseFirebaseRepository
   implements IUserRepository
{
   constructor(
      private readonly firestore: firebase.firestore.Firestore,
      private readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      let userRef = this.firestore.collection("userData").doc(userEmail)

      return userRef.update({
         interestsIds: Array.from(new Set(interestIds)),
      })
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
      }

      return docRef.set(toInsert, { merge: true })
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
}

const documentIdJobApplication = (jobIdentifier: JobIdentifier) => {
   return `${jobIdentifier.groupId}_${jobIdentifier.integrationId}_${jobIdentifier.jobId}`
}
