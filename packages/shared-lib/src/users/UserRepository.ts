import BaseFirebaseRepository from "../BaseFirebaseRepository"
import {
   SavedRecruiter,
   UserATSDocument,
   UserATSRelations,
   UserData,
} from "./users"
import firebase from "firebase/compat/app"

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

   associateATSData(
      id: string,
      accountId: string,
      data: Partial<UserATSRelations>
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
}
