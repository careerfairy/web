import { firebaseServiceInstance } from "./FirebaseService"
import firebase from "firebase/app"
import { UserData } from "@careerfairy/shared-lib/dist/users"

export interface IUserRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>

   getUserDataByUid(uid: string): Promise<UserData>

   getUsersDataByUids(uids: string[]): Promise<UserData[]>
}

class FirebaseUserRepository implements IUserRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      let userRef = this.firestore.collection("userData").doc(userEmail)

      return userRef.update({
         interestsIds: Array.from(new Set(interestIds)),
      })
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
}

// Singleton
const userRepo: IUserRepository = new FirebaseUserRepository(
   firebaseServiceInstance.firestore
)

export default userRepo
