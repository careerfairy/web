import { firebaseServiceInstance } from "./FirebaseService"
import firebase from "firebase/app"

export interface IUserRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>
}

class FirebaseUserRepository implements IUserRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

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
   getSavedRecruiters(userEmail: string): Promise<string[]> {
      let userRef = this.firestore.collection("userData").doc(userEmail)

      return userRef.get().then((userDoc) => {
         if (!userDoc.exists) {
            return []
         }

         return userDoc.data().savedRecruiters
      })
   }

   // addSavedRecruiter
   // deleteSavedRecruiter
}

// Singleton
const userRepo: IUserRepository = new FirebaseUserRepository(
   firebaseServiceInstance.firestore
)

export default userRepo
