import firebase from "firebase/app"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { SavedRecruiter, UserData } from "./users"

export interface IUserRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>

   getSavedRecruiters(userEmail: string): Promise<SavedRecruiter[]>

   saveRecruiter(userEmail: string, recruiter: SavedRecruiter): Promise<void>

   getSavedRecruiter(userEmail: string, id: string): Promise<SavedRecruiter>

   removeSavedRecruiter(userEmail: string, recruiterId: string): Promise<void>

   getUserDataByUid(uid: string): Promise<UserData>

   getUsersDataByUids(uids: string[]): Promise<UserData[]>
   getUsersByEmail(
      arrayOfEmails: string[],
      options?: { withEmpty: boolean }
   ): Promise<UserData[]>
   getAllUsers(): Promise<UserData[]>
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

   async getAllUsers(): Promise<UserData[]> {
      const users = await this.firestore.collection("userData").get()
      return mapFirestoreDocuments<UserData>(users, true)
   }
}
