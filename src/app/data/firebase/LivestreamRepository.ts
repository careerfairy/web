import firebase from "firebase/app";
import firebaseApp from "./FirebaseInstance";

export interface ILivestreamRepository {
   getUpcomingEvents(
      limit?: number
   ): Promise<
      firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
   >;
   getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<
      firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
   >;
}

class FirebaseLivestreamRepository implements ILivestreamRepository {
   private earliestEventBufferTime: Date;
   constructor(private readonly firestore: firebase.firestore.Firestore) {
      this.earliestEventBufferTime = new Date(Date.now() - 2700000);
   }

   getUpcomingEvents(
      limit?: number
   ): Promise<
      firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
   > {
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .orderBy("start", "asc");
      if (limit) {
         livestreamRef = livestreamRef.limit(limit);
      }
      return livestreamRef.get();
   }

   getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<
      firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
   > {
      if (!userEmail) return;
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail)
         .orderBy("start", "asc");
      if (limit) {
         livestreamRef = livestreamRef.limit(limit);
      }
      return livestreamRef.get();
   }
}

// Singleton
const livestreamRepo: ILivestreamRepository = new FirebaseLivestreamRepository(
   firebaseApp.firestore()
);

export default livestreamRepo;
