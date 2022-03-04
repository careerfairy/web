import firebase from "firebase/app";
import firebaseApp from "./FirebaseInstance";
import { QuerySnapshot } from "@firebase/firestore-types";
import { LiveStreamEvent } from "../../types/event";

export interface ILivestreamRepository {
   getUpcomingEvents(limit?: number): Promise<LiveStreamEvent[] | null>;
   getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<LiveStreamEvent[] | null>;
   getRecommendEvents(
      userEmail: string,
      userInterestsIds?: string[],
      limit?: number
   ): Promise<LiveStreamEvent[] | null>;
   getDocumentData(documentSnapshot: QuerySnapshot): LiveStreamEvent[] | null;
}

class FirebaseLivestreamRepository implements ILivestreamRepository {
   private earliestEventBufferTime: Date;
   constructor(private readonly firestore: firebase.firestore.Firestore) {
      this.earliestEventBufferTime = new Date(Date.now() - 2700000);
   }

   getDocumentData(documentSnapshot: QuerySnapshot): LiveStreamEvent[] | null {
      let docs = null;
      if (!documentSnapshot.empty) {
         docs = documentSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
         }));
      }
      return docs;
   }

   async getUpcomingEvents(limit?: number): Promise<LiveStreamEvent[] | null> {
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .orderBy("start", "asc");
      if (limit) {
         livestreamRef = livestreamRef.limit(limit);
      }
      const snapshots = await livestreamRef.get();
      return this.getDocumentData(snapshots);
   }

   async getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<LiveStreamEvent[] | null> {
      if (!userEmail) return null;
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail)
         .orderBy("start", "asc");
      if (limit) {
         livestreamRef = livestreamRef.limit(limit);
      }
      const snapshots = await livestreamRef.get();
      return this.getDocumentData(snapshots);
   }

   async getRecommendEvents(
      userEmail: string,
      userInterestsIds?: string[],
      limit?: number
   ): Promise<LiveStreamEvent[] | null> {
      if (!userEmail || !userInterestsIds?.length) return null;
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("interestsIds", "array-contains-any", userInterestsIds)
         .orderBy("start", "asc");
      if (limit) {
         livestreamRef = livestreamRef.limit(limit);
      }
      const snapshots = await livestreamRef.get();
      let interestedEvents = this.getDocumentData(snapshots);
      if (interestedEvents) {
         interestedEvents = interestedEvents.filter(
            (event) => !event.registeredUsers?.includes(userEmail)
         );
      }
      return interestedEvents;
   }
}

// Singleton
const livestreamRepo: ILivestreamRepository = new FirebaseLivestreamRepository(
   firebaseApp.firestore()
);

export default livestreamRepo;
