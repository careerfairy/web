import firebase from "firebase/app";
import firebaseApp from "./FirebaseInstance";

export interface IUserRepository {
   updateInterests(userEmail: string, interestsIds: string[]): Promise<void>;
}

class FirebaseUserRepository implements IUserRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   updateInterests(userEmail: string, interestIds: string[]): Promise<void> {
      let userRef = this.firestore.collection("userData").doc(userEmail);

      return userRef.update({
         interestsIds: Array.from(new Set(interestIds)),
      });
   }
}

// Singleton
const userRepo: IUserRepository = new FirebaseUserRepository(
   firebaseApp.firestore()
);

export default userRepo;
