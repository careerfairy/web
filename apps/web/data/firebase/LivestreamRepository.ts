import firebase from "firebase/app"
import firebaseApp from "./FirebaseInstance"
import { DocumentSnapshot, QuerySnapshot } from "@firebase/firestore-types"
import { LiveStreamEvent } from "../../types/event"
import { NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST } from "../../constants/streams"
import { mapFirestoreDocuments } from "../../util/FirebaseUtils"

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

   getPastEventsFrom(
      fromDate: Date,
      filterByGroupId?: string,
      limit?: number
   ): Promise<LiveStreamEvent[]>

   recommendEventsQuery(
      userInterestsIds?: string[]
   ): firebase.firestore.Query<firebase.firestore.DocumentData>

   upcomingEventsQuery(
      showHidden?: boolean
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
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   private mapLivestreamCollections(
      documentSnapshot: QuerySnapshot
   ): LivestreamsDataParser {
      const docs = mapFirestoreDocuments<LiveStreamEvent>(documentSnapshot)
      return new LivestreamsDataParser(docs).complementaryFields()
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

   upcomingEventsQuery(showHidden: boolean = false) {
      return this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", showHidden)
         .orderBy("start", "asc")
   }

   async getUpcomingEvents(limit?: number): Promise<LiveStreamEvent[] | null> {
      let livestreamRef = this.upcomingEventsQuery()
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      return this.mapLivestreamCollections(snapshots)
         .filterByNotEndedEvents()
         .get()
   }

   async getPastEventsFrom(
      fromDate: Date,
      filterByGroupId?: string,
      limit?: number
   ) {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", fromDate)
         .where("start", "<", new Date())
         .where("test", "==", false)
         .orderBy("start", "desc")

      if (limit) {
         query = query.limit(limit)
      }

      if (filterByGroupId) {
         query = query.where("groupIds", "array-contains", filterByGroupId)
      }

      return this.mapLivestreamCollections(await query.get())
         .filterByEndedEvents()
         .get()
   }

   registeredEventsQuery(userEmail: string) {
      return this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
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
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      return this.mapLivestreamCollections(snapshots).get()
   }

   listenToRegisteredEvents(
      userEmail: string,
      limit: number,
      callback: (snapshot: QuerySnapshot) => void
   ) {
      if (!userEmail) return null
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
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
         .where("start", ">", getEarliestEventBufferTime())
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
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("interestsIds", "array-contains-any", userInterestsIds)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      let interestedEvents = this.mapLivestreamCollections(snapshots).get()
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
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("interestsIds", "array-contains-any", userInterestsIds)
         .orderBy("start", "asc")
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      return livestreamRef.onSnapshot(callback)
   }
}

function getEarliestEventBufferTime() {
   return new Date(
      Date.now() - NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST
   )
}

/*
|--------------------------------------------------------------------------
| Mappings and Filters
|--------------------------------------------------------------------------
*/
export class LivestreamsDataParser {
   constructor(private livestreams: LiveStreamEvent[]) {}

   filterByNotEndedEvents() {
      this.livestreams = this.livestreams?.filter((e) => !e.hasEnded)
      return this
   }

   filterByEndedEvents() {
      this.livestreams = this.livestreams?.filter((e) => {
         if (e.hasEnded) return true

         // check if event is some time in the past
         if (e.start) {
            const pastTime = new Date(
               Date.now() - NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST
            )

            return e.start.toDate() < pastTime
         }

         return true
      })
      return this
   }

   filterByTargetCategories(groupId: string, categories: string[]) {
      this.livestreams = this.livestreams.reduce(
         (accumulator, currentLivestream) => {
            if (currentLivestream.targetCategories) {
               const livestreamCategories =
                  currentLivestream.targetCategories[groupId]
               if (categories.length && livestreamCategories) {
                  if (
                     categories.some((v) => livestreamCategories.includes(v))
                  ) {
                     return accumulator.concat(currentLivestream)
                  }
               } else if (!categories.length) {
                  return accumulator.concat(currentLivestream)
               }
            } else {
               return accumulator.concat(currentLivestream)
            }
            return accumulator
         },
         []
      )

      return this
   }

   complementaryFields() {
      this.livestreams = this.livestreams?.map((e) => ({
         ...e,
         startDate: e.start?.toDate(),
      }))

      return this
   }

   get() {
      return this.livestreams
   }
}

// Singleton
const livestreamRepo: ILivestreamRepository = new FirebaseLivestreamRepository(
   firebaseApp.firestore()
)

export default livestreamRepo
