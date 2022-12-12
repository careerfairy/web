import firebase from "firebase/compat/app"
import { UserPublicData } from "../users"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
   removeDuplicateDocuments,
} from "../BaseFirebaseRepository"
import {
   getEarliestEventBufferTime,
   LivestreamEvent,
   LivestreamEventParsed,
   LivestreamEventPublicData,
   LivestreamEventSerialized,
   LivestreamJobApplicationDetails,
   LivestreamUserAction,
   NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST,
   UserLivestreamData,
} from "./livestreams"
import { FieldOfStudy } from "../fieldOfStudy"
import { Job, JobIdentifier } from "../ats/Job"

export interface ILivestreamRepository {
   getUpcomingEvents(limit?: number): Promise<LivestreamEvent[] | null>

   getUpcomingEventsByFieldsOfStudy(
      fieldsOfStudy: FieldOfStudy[],
      limit?: number
   ): Promise<LivestreamEvent[] | null>

   getRegisteredEvents(
      userEmail: string,
      limit?: number
   ): Promise<LivestreamEvent[] | null>

   getRecommendEvents(
      userEmail: string,
      userInterestsIds?: string[],
      limit?: number
   ): Promise<LivestreamEvent[] | null>

   listenToRecommendedEvents(
      userEmail: string,
      userInterestsIds: string[],
      limit: number,
      callback: (snapshot: firebase.firestore.QuerySnapshot) => void
   )

   listenToRegisteredEvents(
      userEmail: string,
      limit: number,
      callback: (snapshot: firebase.firestore.QuerySnapshot) => void
   )

   getPastEventsFrom(props: {
      fromDate: Date
      filterByGroupId?: string
      limit?: number
      showHidden?: boolean
   }): Promise<LivestreamEvent[]>

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
      callback: (snapshot: firebase.firestore.DocumentSnapshot) => void
   )

   eventsOfGroupQuery(
      groupId: string,
      type: "upcoming" | "past",
      hideHidden?: boolean
   ): firebase.firestore.Query<firebase.firestore.DocumentData>

   getEventsOfGroup(
      groupId: string,
      type: "upcoming" | "past",
      options?: {
         limit?: number
         hideHidden?: boolean
      }
   ): Promise<LivestreamEvent[] | null>

   serializeEvent(event: LivestreamEvent): LivestreamEventSerialized

   parseSerializedEvent(event: LivestreamEventSerialized): LivestreamEventParsed

   heartbeat(
      livestream: LivestreamEventPublicData,
      userData: UserPublicData,
      elapsedMinutes: number
   ): Promise<void>

   getLivestreamUsers(
      eventId: string,
      userType: LivestreamUserAction
   ): Promise<UserLivestreamData[]>

   livestreamUsersQuery(
      eventId: string,
      userType: LivestreamUserAction
   ): firebase.firestore.Query

   livestreamUsersQueryWithRef(
      streamRef: firebase.firestore.DocumentReference,
      userType: LivestreamUserAction
   ): firebase.firestore.Query

   getById(id: string): Promise<LivestreamEvent>

   /**
    * Update the userLivestreamData/{userId} document with the job application details
    * @param livestreamId
    * @param userId
    * @param jobIdentifier
    * @param job
    */
   saveJobApplication(
      livestreamId: string,
      userId: string,
      jobIdentifier: JobIdentifier,
      job: Job
   ): Promise<void>

   getLivestreamUser(
      eventId: string,
      userId: string
   ): Promise<UserLivestreamData>

   isUserRegisterOnAnyLivestream(userId: string): Promise<boolean>
}

export class FirebaseLivestreamRepository
   extends BaseFirebaseRepository
   implements ILivestreamRepository
{
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   async getLivestreamUser(
      eventId: string,
      userId: string
   ): Promise<UserLivestreamData> {
      const snap = await this.firestore
         .collection("livestreams")
         .doc(eventId)
         .collection("userLivestreamData")
         .doc(userId)
         .get()

      if (snap.exists) {
         return this.addIdToDoc<UserLivestreamData>(snap)
      }

      return null
   }

   private mapLivestreamCollections(
      documentSnapshot: firebase.firestore.QuerySnapshot
   ): LivestreamsDataParser {
      const docs = mapFirestoreDocuments<LivestreamEvent>(documentSnapshot)
      return new LivestreamsDataParser(docs || []).complementaryFields()
   }

   async getById(id: string): Promise<LivestreamEvent> {
      const doc = await this.firestore.collection("livestreams").doc(id).get()

      if (!doc.exists) return null

      return this.addIdToDoc<LivestreamEvent>(doc)
   }

   heartbeat(
      livestream: LivestreamEventPublicData,
      userData: UserPublicData,
      elapsedMinutes: number
   ): Promise<void> {
      const data = {
         id: userData.id,
         livestreamId: livestream.id,
         totalMinutes: this.fieldValue.increment(1),
         minutes: this.fieldValue.arrayUnion(elapsedMinutes),
         livestream,
         user: userData,
      }
      return this.firestore
         .collection("livestreams")
         .doc(livestream.id)
         .collection("participatingStats")
         .doc(userData.id)
         .set(data, { merge: true })
   }

   listenToSingleEvent(
      eventId: string,
      callback: (snapshot: firebase.firestore.DocumentSnapshot) => void
   ) {
      return (
         this.firestore
            .collection("livestreams")
            .doc(eventId)
            // @ts-ignore
            .onSnapshot(callback)
      )
   }

   eventsOfGroupQuery(
      groupId: string,
      type: "upcoming" | "past",
      hideHidden?: boolean
   ) {
      let query = this.firestore
         .collection("livestreams")
         .where("groupIds", "array-contains", groupId)
         .where("test", "==", false)
      if (hideHidden) {
         query = query.where("hidden", "==", false)
      }
      if (type === "upcoming") {
         query = query.where("start", ">=", new Date()).orderBy("start", "asc")
      } else {
         query = query.where("start", "<", new Date()).orderBy("start", "desc")
      }
      return query
   }

   async getEventsOfGroup(
      groupId: string,
      type: "upcoming" | "past",
      options?: {
         limit?: number
         hideHidden?: boolean
      }
   ): Promise<LivestreamEvent[] | null> {
      let query = this.eventsOfGroupQuery(groupId, type, options?.hideHidden)
      if (options.limit) {
         query = query.limit(options.limit)
      }
      const snapshots = await query.get()
      return this.mapLivestreamCollections(snapshots).get()
   }

   upcomingEventsQuery(showHidden: boolean = false) {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .orderBy("start", "asc")

      if (showHidden === false) {
         query = query.where("hidden", "==", false)
      }

      return query
   }

   async getUpcomingEvents(limit?: number): Promise<LivestreamEvent[] | null> {
      let livestreamRef = this.upcomingEventsQuery()
      if (limit) {
         livestreamRef = livestreamRef.limit(limit)
      }
      const snapshots = await livestreamRef.get()
      return this.mapLivestreamCollections(snapshots)
         .filterByNotEndedEvents()
         .get()
   }

   async getUpcomingEventsByFieldsOfStudy(
      fieldsOfStudy: FieldOfStudy[],
      limit?: number
   ): Promise<LivestreamEvent[] | null> {
      // convert fieldsOfStudy to array of chunks of 10
      let livestreams = []
      let i,
         j,
         tempArray: FieldOfStudy[] = [],
         chunk = 10
      /*
       * In case there are more than 10 fieldsOfStudy
       * array-contains-any can only do 10 at a time
       * */
      for (i = 0, j = fieldsOfStudy.length; i < j; i += chunk) {
         tempArray = fieldsOfStudy.slice(i, i + chunk)
         let ref = await this.firestore
            .collection("livestreams")
            .where("start", ">", getEarliestEventBufferTime())
            .where("targetFieldsOfStudy", "array-contains-any", tempArray)
            .where("test", "==", false)
            .where("hidden", "==", false)
            .orderBy("start", "asc")
         if (limit) {
            ref = ref.limit(limit)
         }
         const snapshots = await ref.get()
         livestreams = [
            ...livestreams,
            ...this.mapLivestreamCollections(snapshots).get(),
         ]
      }
      if (livestreams.length === 0) {
         return null
      }
      return removeDuplicateDocuments(livestreams)
   }

   async getPastEventsFrom({
      fromDate,
      filterByGroupId,
      limit,
      showHidden = false,
   }) {
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

      if (showHidden === false) {
         query = query.where("hidden", "==", false)
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
   ): Promise<LivestreamEvent[] | null> {
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
      callback: (snapshot: firebase.firestore.QuerySnapshot) => void
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

   serializeEvent(livestreamEvent: LivestreamEvent): LivestreamEventSerialized {
      const event = { ...livestreamEvent }
      return {
         id: event.id,
         company: event.company || null,
         title: event.title || null,
         companyLogoUrl: event.companyLogoUrl || null,
         backgroundImageUrl: event.backgroundImageUrl || null,
         speakers: event.speakers || [],
         summary: event.summary || null,
         createdDateString: event.created?.toDate?.().toString() || null,
         lastUpdatedDateString:
            event.lastUpdated?.toDate?.().toString() || null,
         startDateString: event.start?.toDate?.().toString() || null,
         groupQuestionsMap: event.groupQuestionsMap || null,
         duration: event.duration || null,
         hasEnded: event.hasEnded || false,
         targetCategories: event.targetCategories || null,
         author: event.author || null,
         companyId: event.companyId || null,
         currentSpeakerId: event.currentSpeakerId || null,
         groupIds: event.groupIds || [],
         interestsIds: event.interestsIds || [],
         hasStarted: event.hasStarted || false,
         hidden: event.hidden || false,
         test: event.test || false,
         isRecording: event.isRecording || false,
         language: event.language || null,
         type: event.type || null,
         universities: event.universities || [],
      }
   }

   parseSerializedEvent(
      serializedEvent: LivestreamEventSerialized
   ): LivestreamEventParsed {
      return {
         ...serializedEvent,
         startDate: serializedEvent.startDateString
            ? new Date(serializedEvent.startDateString)
            : null,
         createdDate: serializedEvent.createdDateString
            ? new Date(serializedEvent.createdDateString)
            : null,
         lastUpdatedDate: serializedEvent.lastUpdatedDateString
            ? new Date(serializedEvent.lastUpdatedDateString)
            : null,
      }
   }

   async getRecommendEvents(
      userEmail: string,
      userInterestsIds?: string[],
      limit?: number
   ): Promise<LivestreamEvent[] | null> {
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
      callback: (snapshot: firebase.firestore.QuerySnapshot) => void
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

   async getLivestreamUsers(
      eventId: string,
      userType: LivestreamUserAction
   ): Promise<UserLivestreamData[]> {
      const snaps = await this.livestreamUsersQuery(eventId, userType).get()
      return mapFirestoreDocuments<UserLivestreamData>(snaps)
   }

   livestreamUsersQuery(
      eventId: string,
      userAction: LivestreamUserAction
   ): firebase.firestore.Query {
      return this.firestore
         .collection("livestreams")
         .doc(eventId)
         .collection("userLivestreamData")
         .where(`${userAction}.date`, "!=", null)
   }

   livestreamUsersQueryWithRef(
      streamRef: firebase.firestore.DocumentReference,
      userAction: LivestreamUserAction
   ): firebase.firestore.Query {
      return streamRef
         .collection("userLivestreamData")
         .where(`${userAction}.date`, "!=", null)
   }

   saveJobApplication(
      livestreamId: string,
      userId: string,
      jobIdentifier: JobIdentifier,
      job: Job
   ): Promise<void> {
      // should already exist since the user registered & participated
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("userLivestreamData")
         .doc(userId)

      const details: LivestreamJobApplicationDetails = {
         jobId: jobIdentifier.jobId,
         groupId: jobIdentifier.groupId,
         integrationId: jobIdentifier.integrationId,
         // @ts-ignore
         date: this.fieldValue.serverTimestamp(),
         job: job.serializeToPlainObject(),
      }

      const toUpdate: Partial<UserLivestreamData> = {
         [`jobApplications.${jobIdentifier.jobId}`]: details,
      }

      return docRef.update(toUpdate)
   }

   async isUserRegisterOnAnyLivestream(authUid: string): Promise<boolean> {
      try {
         const snaps = await this.firestore
            .collectionGroup("userLivestreamData")
            .where("userId", "==", authUid)
            .where(`registered.date`, "!=", null)
            .limit(1)
            .get()

         return !snaps.empty
      } catch (error) {
         return false
      }
   }
}

/*
|--------------------------------------------------------------------------
| Mappings and Filters
|--------------------------------------------------------------------------
*/
export class LivestreamsDataParser {
   constructor(private livestreams: LivestreamEvent[]) {}

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

   filterByHasJobs() {
      this.livestreams = this.livestreams?.filter(({ jobs }) => jobs.length > 0)
      return this
   }

   filterByLanguages(languagesIds: string[]) {
      this.livestreams = this.livestreams?.filter(({ language }) =>
         languagesIds.includes(language.code)
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
