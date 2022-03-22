import firebase from "firebase/app"
import firebaseApp from "./FirebaseInstance"
import { DocumentSnapshot, QuerySnapshot } from "@firebase/firestore-types"
import { LiveStreamEvent } from "../../types/event"
import { NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST } from "../../constants/streams"

export interface ILivestreamRepository {
   getUpcomingEvents(limit?: number): Promise<LiveStreamEvent[] | null>
   getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<LiveStreamEvent[] | null>
   getRecommendEvents(
      userEmail: string,
      userInterestsIds?: string[],
      limit?: number
   ): Promise<LiveStreamEvent[] | null>
   getDocumentData(documentSnapshot: QuerySnapshot): LiveStreamEvent[] | null
   listenToRecommendedEvents(
      userEmail: string,
      userInterestsIds: string[],
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   )
   listenToRegisteredEvents(
      userEmail: string,
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   )
   listenToUpcomingEvents(
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   )
   recommendEventsQuery(
      userInterestsIds?: string[]
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   upcomingEventsQuery(
      userInterestsIds?: string[]
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   registeredEventsQuery(
      userEmail: string
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   featuredEventQuery(): firebase.firestore.Query<firebase.firestore.DocumentData>
   listenToSingleEvent(
      eventId: string,
      callback: (snapshot: DocumentSnapshot) => void
   )
}

class FirebaseLivestreamRepository implements ILivestreamRepository {
   private earliestEventBufferTime: Date
   constructor(private readonly firestore: firebase.firestore.Firestore) {
      this.earliestEventBufferTime = new Date(
         Date.now() - NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST
      )
   }

   getDocumentData(documentSnapshot: QuerySnapshot): LiveStreamEvent[] | null {
      let docs = null
      if (!documentSnapshot.empty) {
         docs = documentSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            startDate: doc.data().start?.toDate?.(),
         }))
      }
      return docs
   }

   upcomingEventsQuery() {
      return this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("hidden", "==", false)
         .orderBy("start", "asc")
   }
   listenToSingleEvent(
      eventId: string,
      callback: (snapshot: DocumentSnapshot) => void
   ) {
      return (
         this.firestore
            .collection("livestreams")
            .doc(eventId)
            // @ts-ignore
            .onSnapshot(callback)
      )
   }
   async getUpcomingEvents(limit?: number): Promise<LiveStreamEvent[] | null> {
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("hidden", "==", false)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      return this.getDocumentData(snapshots)
   }

   listenToUpcomingEvents(
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   ) {
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      return livestreamRef.onSnapshot(callback)
   }

   registeredEventsQuery(userEmail: string) {
      return this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail || "")
         .orderBy("start", "asc")
   }
   async getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<LiveStreamEvent[] | null> {
      if (!userEmail) return null
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      return this.getDocumentData(snapshots)
   }

   listenToRegisteredEvents(
      userEmail: string,
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   ) {
      if (!userEmail) return null
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      return livestreamRef.onSnapshot(callback)
   }
   recommendEventsQuery(userInterestsIds?: string[]) {
      return this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("hidden", "==", false)
         .where(
            "interestsIds",
            "array-contains-any",
            userInterestsIds?.length ? userInterestsIds : [""]
         )
         .orderBy("start", "asc")
   }

   featuredEventQuery() {
      return this.firestore
         .collection("livestreams")
         .where("test", "==", false)
         .where("hidden", "==", false)
         .where("featured", "==", true)
         .orderBy("start", "desc")
   }
   async getRecommendEvents(
      userEmail: string,
      userInterestsIds?: string[],
      limit?: number
   ): Promise<LiveStreamEvent[] | null> {
      if (!userEmail || !userInterestsIds?.length) return null
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("interestsIds", "array-contains-any", userInterestsIds)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      let interestedEvents = this.getDocumentData(snapshots)
      if (interestedEvents) {
         interestedEvents = interestedEvents.filter(
            (event) => !event.registeredUsers?.includes(userEmail)
         )
      }
      return interestedEvents
   }

   listenToRecommendedEvents(
      userEmail: string,
      userInterestsIds: string[],
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   ) {
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", this.earliestEventBufferTime)
         .where("test", "==", false)
         .where("interestsIds", "array-contains-any", userInterestsIds)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      return livestreamRef.onSnapshot(callback)
   }
}

// Singleton
const livestreamRepo: ILivestreamRepository = new FirebaseLivestreamRepository(
   firebaseApp.firestore()
)

export default livestreamRepo
