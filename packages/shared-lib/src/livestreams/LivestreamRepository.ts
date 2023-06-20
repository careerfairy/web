import firebase from "firebase/compat/app"
import { UserPublicData } from "../users"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
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
   LivestreamRecordingDetails,
   LivestreamUserAction,
   NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST,
   RecordingStats,
   RecordingToken,
   UserLivestreamData,
   UserParticipatingStats,
} from "./livestreams"
import { FieldOfStudy } from "../fieldOfStudy"
import { Job, JobIdentifier } from "../ats/Job"
import { chunkArray, containsAny } from "../utils"
import {
   createLiveStreamStatsDoc,
   LiveStreamStats,
   LivestreamStatsToUpdate,
} from "./stats"
import { OrderByDirection } from "firebase/firestore"

type UpdateRecordingStatsProps = {
   livestreamId: string
   livestreamStartDate?: firebase.firestore.Timestamp
   minutesWatched?: number
   userId?: string
   onlyIncrementMinutes?: boolean
   usedCredits?: boolean
}

export type PastEventsOptions = {
   fromDate: Date
   filterByGroupId?: string
   limit?: number
   showHidden?: boolean
}

export type RegisteredEventsOptions = {
   limit?: number
   from?: Date
   to?: Date
   orderByDirection?: "asc" | "desc"
}

export interface ILivestreamRepository {
   getUpcomingEvents(limit?: number): Promise<LivestreamEvent[] | null>

   getUpcomingEventsByFieldsOfStudy(
      fieldsOfStudy: FieldOfStudy[],
      limit?: number
   ): Promise<LivestreamEvent[] | null>

   getRegisteredEvents(
      userEmail: string,
      options?: RegisteredEventsOptions
   ): Promise<LivestreamEvent[]>

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

   getPastEventsFrom(options: PastEventsOptions): Promise<LivestreamEvent[]>

   getPastEventsFromQuery(options: PastEventsOptions): firebase.firestore.Query

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
      type?: "upcoming" | "past",
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
    * @param applicationId
    */
   saveJobApplication(
      livestreamId: string,
      userId: string,
      jobIdentifier: JobIdentifier,
      job: Job,
      applicationId: string
   ): Promise<void>

   /**
    * Fetches the userLivestreamData documents that contains job applications for the given
    * livestreams
    *
    * Accepts an array of Livestream IDs, it will create chunks of 10 requests and fetch all
    * documents
    * @param livestreamIds
    */
   getApplications(livestreamIds: string[]): Promise<UserLivestreamData[]>

   /**
    * Fetches livestreams from a group that have jobs associated
    * @param groupId
    */
   getLivestreamsWithJobs(groupId: string): Promise<LivestreamEvent[] | null>

   getLivestreamUser(
      eventId: string,
      userId: string
   ): Promise<UserLivestreamData>

   isUserRegisterOnAnyLivestream(userId: string): Promise<boolean>

   /*
    * Get a maximum of 10 livestreams via their IDs
    * @param ids - the IDs of the livestreams to get (max 10). If more than 10 are provided, only the first 10 will be used
    * */
   getLivestreamsByIds(ids: string[]): Promise<LivestreamEvent[]>

   getLivestreamRecordingToken(livestreamId: string): Promise<RecordingToken>

   getLivestreamRecordingStats(livestreamId: string): Promise<RecordingStats>

   getRecordedEventsByUserId(
      userId: string,
      dateLimit: Date
   ): Promise<LivestreamEvent[]>

   updateRecordingStats({
      livestreamId,
      livestreamStartDate,
      minutesWatched,
      userId,
      onlyIncrementMinutes,
      usedCredits,
   }: UpdateRecordingStatsProps): Promise<void>

   getLivestreamRecordingTokenAndIncrementViewStat(
      livestreamId: string,
      livestreamStartDate: firebase.firestore.Timestamp,
      userId: string
   ): Promise<RecordingToken>

   updateLiveStreamStats<T extends LivestreamStatsToUpdate>(
      livestreamId: string,
      operationsToMake: (existingStats: LiveStreamStats) => T
   ): Promise<void>

   getFutureLivestreamsQuery(
      groupId: string,
      limit?: number,
      fromDate?: Date
   ): firebase.firestore.Query
   getClosestFutureLivestreamStatsFromDate(
      groupId: string,
      fromDate?: Date
   ): Promise<LiveStreamStats>
   getClosestPastLivestreamStatsFromDate(
      groupId: string,
      fromDate?: Date
   ): Promise<LiveStreamStats>

   getGroupDraftLivestreamsQuery(
      groupId: string,
      limit?: number,
      order?: OrderByDirection
   ): firebase.firestore.Query
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

   getGroupDraftLivestreamsQuery(
      groupId: string,
      limit?: number,
      order: OrderByDirection = "asc"
   ): firebase.firestore.Query {
      let query = this.firestore
         .collection("draftLivestreams")
         .where("groupIds", "array-contains", groupId)
         .orderBy("start", order)

      if (limit) {
         query.limit(limit)
      }

      return query
   }

   getFutureLivestreamsQuery(
      groupId: string,
      limit = 1,
      fromDate = new Date()
   ): firebase.firestore.Query {
      return this.firestore
         .collection("livestreams")
         .where("start", ">", fromDate)
         .where("test", "==", false)
         .where("groupIds", "array-contains", groupId)
         .limit(limit)
         .orderBy("start", "asc")
   }

   async getClosestFutureLivestreamStatsFromDate(
      groupId: string,
      fromDate = new Date()
   ): Promise<LiveStreamStats> {
      const snap = await this.firestore
         .collectionGroup("stats")
         .where("id", "==", "livestreamStats")
         .where("livestream.groupIds", "array-contains", groupId)
         .where("livestream.start", ">", fromDate)
         .where("livestream.test", "==", false)
         .withConverter(createCompatGenericConverter<LiveStreamStats>())
         .orderBy("livestream.start", "asc")
         .limit(1)
         .get()

      return snap.docs[0]?.data() || null
   }

   async getClosestPastLivestreamStatsFromDate(
      groupId: string,
      fromDate = new Date()
   ): Promise<LiveStreamStats> {
      const snap = await this.firestore
         .collectionGroup("stats")
         .where("id", "==", "livestreamStats")
         .where("livestream.groupIds", "array-contains", groupId)
         .where("livestream.start", "<", fromDate)
         .where("livestream.test", "==", false)
         .withConverter(createCompatGenericConverter<LiveStreamStats>())
         .orderBy("livestream.start", "desc")
         .limit(1)
         .get()

      return snap.docs[0]?.data() || null
   }

   async updateLiveStreamStats<T extends LivestreamStatsToUpdate>(
      livestreamId: string,
      operationsToMake: (existingStats: LiveStreamStats) => T
   ): Promise<void> {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)

      const statsRef = livestreamRef.collection("stats").doc("livestreamStats")

      const statsSnap = await statsRef.get()
      let existingStats: LiveStreamStats

      if (!statsSnap.exists) {
         // Create the stats document
         const livestreamDoc = await livestreamRef.get()

         if (!livestreamDoc.exists) {
            return // Livestream was deleted, no need to update the stats
         }

         existingStats = createLiveStreamStatsDoc(
            this.addIdToDoc<LivestreamEvent>(livestreamDoc),
            statsRef.id
         )

         await statsRef.set(existingStats)
      } else {
         existingStats = this.addIdToDoc<LiveStreamStats>(statsSnap)
      }

      // We have to use an update method here because the set method does not support nested updates/operations
      return statsRef.update(operationsToMake(existingStats))
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
      const data: UserParticipatingStats = {
         id: userData.id,
         livestreamId: livestream.id,
         totalMinutes: this.fieldValue.increment(1) as any,
         minutes: this.fieldValue.arrayUnion(elapsedMinutes) as any,
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
      type?: "upcoming" | "past",
      hideHidden?: boolean
   ) {
      let query = this.firestore
         .collection("livestreams")
         .where("groupIds", "array-contains", groupId)
         .where("test", "==", false)

      if (hideHidden) {
         query = query.where("hidden", "==", false)
      }

      if (type) {
         if (type === "upcoming") {
            query = query
               .where("start", ">=", new Date())
               .orderBy("start", "asc")
         } else {
            query = query
               .where("start", "<", new Date())
               .orderBy("start", "desc")
         }
      }

      return query
   }

   async getEventsOfGroup(
      groupId: string,
      type?: "upcoming" | "past",
      options?: {
         limit?: number
         hideHidden?: boolean
      }
   ): Promise<LivestreamEvent[] | null> {
      let query = this.eventsOfGroupQuery(groupId, type, options?.hideHidden)

      if (options?.limit) {
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
      let i: number,
         j: number,
         tempArray: FieldOfStudy[] = [],
         chunk = 10
      /*
       * In case there are more than 10 fieldsOfStudy
       * array-contains-any can only do 10 at a time
       * */
      for (i = 0, j = fieldsOfStudy.length; i < j; i += chunk) {
         tempArray = fieldsOfStudy.slice(i, i + chunk)
         let ref = this.firestore
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
      let query = this.getPastEventsFromQuery({
         fromDate,
         filterByGroupId,
         limit,
         showHidden,
      })

      return this.mapLivestreamCollections(await query.get())
         .filterByEndedEvents()
         .get()
   }

   getPastEventsFromQuery(options: PastEventsOptions) {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", options.fromDate)
         .where("start", "<", new Date())
         .where("test", "==", false)
         .orderBy("start", "desc")

      if (options.limit) {
         query = query.limit(options.limit)
      }

      if (options.filterByGroupId) {
         query = query.where(
            "groupIds",
            "array-contains",
            options.filterByGroupId
         )
      }

      if (options.showHidden === false) {
         query = query.where("hidden", "==", false)
      }

      return query
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
      options: RegisteredEventsOptions = {}
   ): Promise<LivestreamEvent[]> {
      let livestreamRef = this.firestore
         .collection("livestreams")
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userEmail)

      if (options.orderByDirection) {
         livestreamRef = livestreamRef.orderBy(
            "start",
            options.orderByDirection
         )
      } else {
         livestreamRef = livestreamRef.orderBy("start", "asc")
      }

      if (options.from) {
         livestreamRef = livestreamRef.where("start", ">", options.from)
      }

      if (options.to) {
         livestreamRef = livestreamRef.where("start", "<", options.to)
      }

      if (options.limit) {
         livestreamRef = livestreamRef.limit(options.limit)
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
         triGrams: event.triGrams || {},
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
      job: Job,
      applicationId: string
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
         applicatonId: applicationId,
         job: job.serializeToPlainObject(),
      }

      const toUpdate: Partial<UserLivestreamData> = {
         [`jobApplications.${jobIdentifier.jobId}`]: details,
      }

      return docRef.update(toUpdate)
   }

   async getLivestreamsWithJobs(
      groupId: any
   ): Promise<LivestreamEvent[] | null> {
      let docs = await this.firestore
         .collection("livestreams")
         .where("groupIds", "array-contains", groupId)
         .where("hasJobs", "==", true)
         .get()

      return mapFirestoreDocuments(docs)
   }

   async getApplications(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]> {
      let chunks = chunkArray(livestreamIds, 10)
      let promises = []

      for (let chunk of chunks) {
         promises.push(
            this.firestore
               .collectionGroup("userLivestreamData")
               .where("jobApplications", "!=", null)
               .where("livestreamId", "in", chunk)
               .get()
               .then(mapFirestoreDocuments)
         )
      }

      let responses = await Promise.allSettled(promises)

      return responses
         .filter((r) => {
            if (r.status === "fulfilled") {
               return true
            } else {
               // only log for debugging purposes
               console.error("Promise failed", r)
            }

            return false
         })
         .map((r) => (r as PromiseFulfilledResult<UserLivestreamData[]>).value)
         .flat()
   }

   async isUserRegisterOnAnyLivestream(authUid: string): Promise<boolean> {
      const snaps = await this.firestore
         .collectionGroup("userLivestreamData")
         .where("userId", "==", authUid)
         .where(`registered.date`, "!=", null)
         .limit(1)
         .get()

      return !snaps.empty
   }

   async getLivestreamsByIds(ids: string[]): Promise<LivestreamEvent[]> {
      let chunks = chunkArray(ids, 10)
      let promises = []

      for (let chunk of chunks) {
         promises.push(
            this.firestore
               .collection("livestreams")
               .where("id", "in", chunk)
               .get()
               .then(mapFirestoreDocuments)
         )
      }

      let responses = await Promise.allSettled(promises)

      return responses
         .filter((r) => {
            if (r.status === "fulfilled") {
               return true
            } else {
               // only log for debugging purposes
               console.error("Promise failed", r)
            }

            return false
         })
         .map((r) => (r as PromiseFulfilledResult<LivestreamEvent[]>).value)
         .flat()
   }

   async getLivestreamRecordingToken(
      livestreamId: string
   ): Promise<RecordingToken> {
      const snap = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("recordingToken")
         .doc("token")
         .get()

      if (snap.exists) {
         return snap.data() as RecordingToken
      }
      return null
   }
   async getLivestreamRecordingStats(
      livestreamId: string
   ): Promise<RecordingStats> {
      const snap = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("recordingStats")
         .doc("stats")
         .get()

      if (snap.exists) {
         return snap.data() as RecordingStats
      }
      return null
   }

   async getRecordedEventsByUserId(
      userId: string,
      dateLimit: Date
   ): Promise<LivestreamEvent[]> {
      const snap = await this.firestore
         .collection("livestreams")
         .where("test", "==", false)
         .where("registeredUsers", "array-contains", userId)
         .where("start", ">=", dateLimit)
         .where("hasEnded", "==", true)
         .orderBy("start", "asc")
         .get()

      return mapFirestoreDocuments<LivestreamEvent>(snap)
   }

   async updateRecordingStats({
      livestreamId,
      livestreamStartDate,
      minutesWatched = 0,
      userId,
      onlyIncrementMinutes = false,
      usedCredits = false,
   }: UpdateRecordingStatsProps): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("recordingStats")
         .doc("stats")

      const details: Omit<LivestreamRecordingDetails, "id"> = {
         livestreamId,
         livestreamStartDate: livestreamStartDate ?? null,
         minutesWatched: this.fieldValue.increment(minutesWatched) as any,
         viewers: this.fieldValue.arrayUnion(userId) as any,
         views: this.fieldValue.increment(1) as any,
      }

      if (usedCredits) {
         // users that bought the recording are also stored in a separated
         // array for analytics purposes
         details.viewersThroughCredits = this.fieldValue.arrayUnion(
            userId
         ) as any
      }

      // when we want only to increment the minutes watch of a specific recording
      if (onlyIncrementMinutes) {
         delete details.views
         delete details.viewers
         delete details.viewersThroughCredits
         delete details.livestreamStartDate
      }

      return docRef.set(details, { merge: true })
   }

   async getLivestreamRecordingTokenAndIncrementViewStat(
      livestreamId: string,
      livestreamStartDate: firebase.firestore.Timestamp,
      userId: string
   ): Promise<RecordingToken> {
      const promises = []
      promises.push(
         this.getLivestreamRecordingToken(livestreamId),
         this.updateRecordingStats({
            livestreamId,
            livestreamStartDate,
            userId,
         })
      )

      const promisesResults = await Promise.allSettled(promises)

      const [recordingToken] = promisesResults
         .filter((result) => result.status === "fulfilled")
         .map((result: PromiseFulfilledResult<RecordingToken>) => result.value)

      return recordingToken
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

   filterByCompanyCountry(companyCountriesIds: string[]) {
      this.livestreams = this.livestreams?.filter(({ companyCountries }) =>
         containsAny(companyCountries, companyCountriesIds)
      )

      return this
   }

   filterByCompanyIndustry(companyIndustryIds: string[]) {
      this.livestreams = this.livestreams?.filter(({ companyIndustries }) =>
         containsAny(companyIndustries, companyIndustryIds)
      )

      return this
   }

   filterByCompanySize(companySize: string[]) {
      this.livestreams = this.livestreams?.filter(({ companySizes }) =>
         containsAny(companySizes, companySize)
      )

      return this
   }

   filterByInterests(ids: string[]) {
      this.livestreams = this.livestreams?.filter(({ interestsIds }) =>
         containsAny(interestsIds, ids)
      )

      return this
   }

   filterByRegisteredUser(userId: string) {
      this.livestreams = this.livestreams?.filter(({ registeredUsers }) =>
         registeredUsers.includes(userId)
      )

      return this
   }

   filterByTargetFieldsOfStudy(fieldsOfStudy: FieldOfStudy[]) {
      this.livestreams = this.livestreams?.filter(({ targetFieldsOfStudy }) => {
         const targetIds = targetFieldsOfStudy?.map((e) => e.id) ?? []
         const ids = fieldsOfStudy?.map((e) => e.id) ?? []

         return containsAny(targetIds, ids)
      })

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
