import firebase from "firebase/compat/app"
import { OrderByDirection } from "firebase/firestore"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
   mapFirestoreDocuments,
   removeDuplicateDocuments,
} from "../BaseFirebaseRepository"
import { Job, JobIdentifier } from "../ats/Job"
import { Create, ImageType } from "../commonTypes"
import { FieldOfStudy } from "../fieldOfStudy"
import { Timestamp } from "../firebaseTypes"
import { Group } from "../groups"
import { UserPublicData } from "../users"
import { arraySortByIndex, chunkArray, containsAny } from "../utils"
import {
   LivestreamCTA,
   LivestreamEvent,
   LivestreamEventParsed,
   LivestreamEventPublicData,
   LivestreamEventSerialized,
   LivestreamJobApplicationDetails,
   LivestreamPoll,
   LivestreamQuestion,
   LivestreamRecordingDetails,
   LivestreamUserAction,
   NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST,
   RecordingStatsUser,
   RecordingToken,
   UserLivestreamData,
   UserParticipatingStats,
   getEarliestEventBufferTime,
} from "./livestreams"
import { MetaData, getMetaDataFromEventHosts } from "./metadata"
import {
   LiveStreamStats,
   LivestreamStatsToUpdate,
   createLiveStreamStatsDoc,
} from "./stats"
import { sortByDateAscending } from "./util"

type UpdateRecordingStatsProps = {
   livestreamId: string
   livestreamStartDate?: firebase.firestore.Timestamp
   minutesWatched?: number
   userId?: string
   onlyIncrementMinutes?: boolean
   usedCredits?: boolean
   lastSecondWatched?: number
}

export type PastEventsOptions = {
   fromDate: Date
   filterByGroupId?: string
   limit?: number
   showHidden?: boolean
}

export type RegisteredEventsOptions = {
   limit?: number
   ended?: boolean
   from?: Date
}

export type GetEventsOfGroupOptions = {
   limit?: number
   hideHidden?: boolean
}

export interface ILivestreamRepository {
   getUpcomingEvents(limit?: number): Promise<LivestreamEvent[] | null>

   getUpcomingEventsByFieldsOfStudy(
      fieldsOfStudy: FieldOfStudy[],
      limit?: number
   ): Promise<LivestreamEvent[] | null>

   /**
    * Retrieves registered live streams for a user.
    *
    * Uses a two-step query process:
    * 1. Query userLivestreamData for registered stream IDs.
    * 2. Fetch live stream events using these IDs.
    *
    * @param userEmail - The email of the user whose registrations we're fetching.
    * @param options - Optional parameters for the query.
    * @returns Promise<LivestreamEvent[]> - Array of LivestreamEvent objects.
    */
   getRegisteredEvents(
      userEmail: string,
      options?: RegisteredEventsOptions
   ): Promise<LivestreamEvent[]>

   getParticipatedEvents(
      userEmail: string,
      limit?: number
   ): Promise<LivestreamEvent[]>

   getPastEventsFrom(options: PastEventsOptions): Promise<LivestreamEvent[]>

   getPastEventsFromQuery(options: PastEventsOptions): firebase.firestore.Query

   recommendEventsQuery(
      userInterestsIds?: string[]
   ): firebase.firestore.Query<firebase.firestore.DocumentData>

   upcomingEventsQuery(
      showHidden?: boolean,
      limit?: number
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
      options?: GetEventsOfGroupOptions
   ): Promise<LivestreamEvent[] | null>

   serializeEvent(event: LivestreamEvent): LivestreamEventSerialized

   parseSerializedEvent(event: LivestreamEventSerialized): LivestreamEventParsed

   heartbeat(
      livestream: LivestreamEventPublicData,
      userData: UserPublicData,
      elapsedMinutes: number
   ): Promise<void>

   getLivestreamNoShowUsers(livestreamId: string): Promise<UserLivestreamData[]>

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

   getDraftLivestreamsByIds(ids: string[]): Promise<LivestreamEvent[]>

   getLivestreamRecordingToken(livestreamId: string): Promise<RecordingToken>

   getLivestreamRecordingStats(
      livestreamId: string
   ): Promise<LivestreamRecordingDetails>

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
      lastSecondWatched,
   }: UpdateRecordingStatsProps): Promise<void>

   updateUserRecordingStats({
      livestreamId,
      livestreamStartDate,
      minutesWatched,
      userId,
      usedCredits,
      lastSecondWatched,
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

   getLivestreamStats(livestreamId: string): Promise<LiveStreamStats>
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

   /**
    * Updates the live streams company logo in the database.
    *
    * @param  livestreamId - The ID of the livestream.
    * @param  isDraft - Whether the livestream is a draft to decide which collection (draftLivestreams or livestreams) to update.
    * @param  image - The image metadata to store in the database.
    * @returns A Promise that resolves when the banner image URL is updated.
    */
   updateLivestreamLogo(
      livestreamId: string,
      isDraft: boolean,
      image: ImageType
   ): Promise<void>

   /**
    * Fetches a poll from a livestream
    * @param livestreamId - The ID of the livestream
    * @param pollId - The ID of the poll
    */
   getPoll(livestreamId: string, pollId: string): Promise<LivestreamPoll>

   /**
    * Creates a poll for a livestream
    * @param livestreamId - The ID of the livestream
    * @param options - The options of the poll
    * @param question - The question of the poll
    */
   createPoll(
      livestreamId: string,
      options: LivestreamPoll["options"],
      question: LivestreamPoll["question"]
   ): Promise<void>

   /**
    * Updates a poll for a livestream
    * @param livestreamId - The ID of the livestream
    * @param pollId - The ID of the poll
    * @param poll - The poll data to update
    */
   updatePoll(
      livestreamId: string,
      pollId: string,
      poll: Partial<Pick<LivestreamPoll, "options" | "question" | "state">>
   ): Promise<void>

   /**
    * Marks a specific poll as current and sets all other polls with the state 'current' to 'closed'.
    *
    * @param livestreamId - The ID of the livestream.
    * @param pollId - The ID of the poll to mark as current.
    * @returns A Promise that resolves when the transaction is complete.
    */
   markPollAsCurrent(livestreamId: string, pollId: string): Promise<void>

   /**
    * Deletes a poll from a livestream
    * @param livestreamId - The ID of the livestream
    * @param pollId - The ID of the poll
    */
   deletePoll(livestreamId: string, pollId: string): Promise<void>

   /**
    * Answers a question for a livestream (marks the question as current and marks the previous current question(s) as done)
    * @param livestreamId - The ID of the livestream
    * @param questionId - The ID of the question to answer
    */
   answerQuestion(livestreamId: string, questionId: string): Promise<void>

   /**
    * Marks a question as done for a livestream
    * @param livestreamId - The ID of the livestream
    * @param questionId - The ID of the question to mark as done
    */
   markQuestionAsDone(livestreamId: string, questionId: string): Promise<void>

   /**
    * Resets a question for a livestream back to unanswered
    * @param livestreamId - The ID of the livestream
    * @param questionId - The ID of the question to reset
    */
   resetQuestion(livestreamId: string, questionId: string): Promise<void>

   /**
    * Resets all questions for a livestream back to unanswered
    * @param livestreamId - The ID of the livestream
    */
   resetAllQuestions(livestreamId: string): Promise<void>

   /**
    * Synchs metadata to be cascaded to the livestream.
    * @param groupId Group ID, used mainly because it group.id might be empty
    * @param group Group object containing details about the company
    */
   syncLivestreamMetadata(groupId: string, group: Group): Promise<void>

   /**
    * Fetches the users latest interacted live streams, with interacted meaning all live streams which the user
    * has either participated or watched a recording of.
    * This method implements sorting of the interacted live streams via the participation date or recording viewing date.
    * A precedence is taken for the recording date if the user has participated in the live stream as well. Meaning all the fetched participated
    * user live streams MUST IGNORE the live streams for which the user has seen the recordings, since the recordings will always be more recent than the
    * live stream participation date.
    * @param userId ID of the user
    * @param limit Limit number of items to retrieve
    */
   getUserInteractedLivestreams(
      userId: string,
      limit?: number
   ): Promise<LivestreamEvent[]>

   /**
    * Checks if a user is registered for a specific livestream
    * @param livestreamId - The ID of the livestream
    * @param userId - The ID of the user
    * @returns A promise that resolves to a boolean indicating if the user is registered
    */
   isUserRegistered(livestreamId: string, userId: string): Promise<boolean>

   /**
    * Fetches a CTA from a livestream
    * @param livestreamId - The ID of the livestream
    * @param ctaId - The ID of the CTA
    */
   getCTA(livestreamId: string, ctaId: string): Promise<LivestreamCTA>

   /**
    * Creates a CTA for a livestream
    * @param livestreamId - The ID of the livestream
    * @param message - The message of the CTA
    * @param buttonText - The text in the button of the CTA
    * @param buttonURL - The URL of the button of the CTA
    */
   createCTA(
      livestreamId: string,
      message: LivestreamCTA["message"],
      buttonText: LivestreamCTA["buttonText"],
      buttonURL: LivestreamCTA["buttonURL"]
   ): Promise<void>

   /**
    * Updates a CTA for a livestream
    * @param livestreamId - The ID of the livestream
    * @param ctaId - The ID of the CTA
    * @param cta - The cta data to update
    */
   updateCTA(
      livestreamId: string,
      ctaId: string,
      cta: Partial<Pick<LivestreamCTA, "message" | "buttonText" | "buttonURL">>
   ): Promise<void>

   /**
    * Marks a specific CTA as active/inactive
    *
    * @param livestreamId - The ID of the livestream
    * @param ctaId - The ID of the CTA to activate
    * @returns A Promise that resolves when the transaction is complete.
    */
   toggleActiveCTA(livestreamId: string, ctaId: string): Promise<void>

   /**
    * Deletes a CTA from a livestream
    * @param livestreamId - The ID of the livestream
    * @param ctaId - The ID of the CTA
    */
   deleteCTA(livestreamId: string, ctaId: string): Promise<void>

   updateLivestreamSmsEnabled(
      livestreamId: string,
      enabled: boolean
   ): Promise<void>
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

   async updateLivestreamLogo(
      livestreamId: string,
      isDraft: boolean,
      image: ImageType
   ): Promise<void> {
      const livestreamRef = this.firestore
         .collection(isDraft ? "draftLivestreams" : "livestreams")
         .doc(livestreamId)

      const toUpdate: Pick<LivestreamEvent, "companyLogoUrl"> = {
         companyLogoUrl: image.url,
      }

      return livestreamRef.update(toUpdate)
   }

   getGroupDraftLivestreamsQuery(
      groupId: string,
      limit?: number,
      order: OrderByDirection = "asc"
   ): firebase.firestore.Query {
      const query = this.firestore
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

   async getLivestreamStats(livestreamId: string): Promise<LiveStreamStats> {
      const snap = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("stats")
         .doc("livestreamStats")
         .get()

      return this.addIdToDoc<LiveStreamStats>(snap)
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
         totalMinutes: this.fieldValue.increment(1) as unknown as number,
         minutes: this.fieldValue.arrayUnion(
            elapsedMinutes
         ) as unknown as string[],
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
      options?: GetEventsOfGroupOptions
   ): Promise<LivestreamEvent[] | null> {
      let query = this.eventsOfGroupQuery(groupId, type, options?.hideHidden)

      if (options?.limit) {
         query = query.limit(options.limit)
      }
      const snapshots = await query.get()
      return this.mapLivestreamCollections(snapshots).get()
   }

   upcomingEventsQuery(showHidden = false, limit?: number) {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .orderBy("start", "asc")

      if (showHidden === false) {
         query = query.where("hidden", "==", false)
      }

      if (limit) {
         query = query.limit(limit)
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
         tempArray: FieldOfStudy[] = []
      const chunk = 10
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
      const query = this.getPastEventsFromQuery({
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

   async getRegisteredEvents(
      userEmail: string,
      options: RegisteredEventsOptions = {}
   ): Promise<LivestreamEvent[]> {
      const { limit = 30, ended = false, from = new Date() } = options

      let userLivestreamDataQuery = this.firestore
         .collectionGroup("userLivestreamData")
         .where("user.userEmail", "==", userEmail)
         .orderBy("registered.date", "desc")
         .withConverter(createCompatGenericConverter<UserLivestreamData>())

      if (limit) {
         userLivestreamDataQuery = userLivestreamDataQuery.limit(limit)
      }

      const userLivestreamDataSnaps = await userLivestreamDataQuery.get()

      const registeredLivestreamIds = userLivestreamDataSnaps.docs
         .map((snap) => snap.data().livestreamId)
         .filter(Boolean)

      const chunks = chunkArray(registeredLivestreamIds, 30) // 30 is the max number of where clauses

      const livestreamPromises = chunks.map(async (ids) => {
         let query = this.firestore
            .collection("livestreams")
            .where("id", "in", ids)
            .where("test", "==", false)
            .where("start", ">=", from)
            .orderBy("start", "asc")
            .withConverter(createCompatGenericConverter<LivestreamEvent>())

         if (ended) {
            query = query.where("hasEnded", "==", true)
         }

         return query.get()
      })

      const livestreamsSnapshots = await Promise.all(livestreamPromises)

      const livestreams = livestreamsSnapshots
         .flatMap((snapshot) => snapshot.docs.map((doc) => doc.data()))
         .sort(sortByDateAscending)

      return livestreams
   }

   async getParticipatedEvents(
      userEmail: string,
      limit = 5
   ): Promise<LivestreamEvent[]> {
      const userLivestreamDataQuery = this.firestore
         .collectionGroup("userLivestreamData")
         .where("user.userEmail", "==", userEmail)
         .where("participated.date", "<", new Date())
         .orderBy("participated.date", "desc")
         .limit(limit)
         .withConverter(createCompatGenericConverter<UserLivestreamData>())

      const snapshots = await userLivestreamDataQuery.get()

      const participatedLivestreamIds = snapshots.docs
         .map((snap) => snap.data().livestreamId)
         .filter(Boolean)

      const chunks = chunkArray(participatedLivestreamIds, 30)

      const livestreamPromises = chunks.map((ids) =>
         this.firestore
            .collection("livestreams")
            .where("id", "in", ids)
            .where("test", "==", false)
            .withConverter(createCompatGenericConverter<LivestreamEvent>())
            .get()
      )

      const livestreams = await Promise.all(livestreamPromises)

      return livestreams.flatMap((snapshot) =>
         snapshot.docs.map((doc) => doc.data())
      )
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
         creatorsIds: event.creatorsIds || [],
         summary: event.summary || null,
         createdDateString: event.created?.toDate?.().toString() || null,
         lastUpdatedDateString:
            event.lastUpdated?.toDate?.().toString() || null,
         startDateString: event.start?.toDate?.().toString() || null,
         startedAtDateString: event.startedAt?.toDate?.().toString() || null,
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
         startedAt: serializedEvent.startedAtDateString
            ? new Date(serializedEvent.startedAtDateString)
            : null,
         createdDate: serializedEvent.createdDateString
            ? new Date(serializedEvent.createdDateString)
            : null,
         lastUpdatedDate: serializedEvent.lastUpdatedDateString
            ? new Date(serializedEvent.lastUpdatedDateString)
            : null,
      }
   }

   async getLivestreamNoShowUsers(
      livestreamId: string
   ): Promise<UserLivestreamData[]> {
      return this.livestreamUsersQuery(livestreamId, "registered")
         .where("participated", "==", null)
         .get()
         .then(mapFirestoreDocuments<UserLivestreamData>)
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
      groupId: string
   ): Promise<LivestreamEvent[] | null> {
      const docs = await this.firestore
         .collection("livestreams")
         .where("groupIds", "array-contains", groupId)
         .where("hasJobs", "==", true)
         .get()

      return mapFirestoreDocuments(docs)
   }

   async getApplications(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]> {
      const chunks = chunkArray(livestreamIds, 10)
      const promises = []

      for (const chunk of chunks) {
         promises.push(
            this.firestore
               .collectionGroup("userLivestreamData")
               .where("jobApplications", "!=", null)
               .where("livestreamId", "in", chunk)
               .get()
               .then(mapFirestoreDocuments)
         )
      }

      const responses = await Promise.allSettled(promises)

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
      const chunks = chunkArray(ids, 10)

      const promises = chunks.map((chunk) =>
         this.firestore
            .collection("livestreams")
            .where("id", "in", chunk)
            .get()
            .then(mapFirestoreDocuments<LivestreamEvent>)
      )

      return this.handlePromiseAllSettled<LivestreamEvent>(promises)
   }

   async getDraftLivestreamsByIds(ids: string[]): Promise<LivestreamEvent[]> {
      const chunks = chunkArray(ids, 10)

      const promises = chunks.map((chunk) =>
         this.firestore
            .collection("draftLivestreams")
            .where("id", "in", chunk)
            .get()
            .then(mapFirestoreDocuments<LivestreamEvent>)
      )

      return this.handlePromiseAllSettled<LivestreamEvent>(promises)
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
   ): Promise<LivestreamRecordingDetails> {
      const snap = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("recordingStats")
         .doc("stats")
         .get()

      if (snap.exists) {
         return snap.data() as LivestreamRecordingDetails
      }
      return null
   }

   async getRecordedEventsByUserId(
      userId: string,
      dateLimit: Date
   ): Promise<LivestreamEvent[]> {
      return this.getRegisteredEvents(userId, {
         from: dateLimit,
         ended: true,
      })
   }

   async updateRecordingStats({
      livestreamId,
      livestreamStartDate,
      minutesWatched = 0,
      userId,
      onlyIncrementMinutes = false,
      usedCredits = false,
      lastSecondWatched,
   }: UpdateRecordingStatsProps): Promise<void> {
      const promises = [
         // update global recordingStats/stats doc
         this.updateRecordingStatsDocument({
            livestreamId,
            livestreamStartDate,
            minutesWatched,
            userId,
            onlyIncrementMinutes,
            usedCredits,
         }),
      ]

      if (userId) {
         // update individual user recording stats
         promises.push(
            this.updateUserRecordingStats({
               userId,
               livestreamId,
               livestreamStartDate,
               minutesWatched,
               usedCredits,
               lastSecondWatched,
            })
         )
      }

      await Promise.all(promises)
   }

   async updateUserRecordingStats({
      livestreamId,
      livestreamStartDate,
      minutesWatched,
      userId,
      usedCredits = false,
      lastSecondWatched,
   }: UpdateRecordingStatsProps) {
      /**
       * 1 document per hour per user views
       * This is a balance to have a reduced number of documents and still
       * be able to easily query this data
       */
      const nearsHourTimestamp = getNearestHourTimestamp()
      const docId = `${userId}_${nearsHourTimestamp}`

      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("recordingStatsUser")
         .doc(docId)

      const details: Create<RecordingStatsUser> = {
         documentType: "recordingStatsUser",
         livestreamId,
         userId,
         recordingBought: usedCredits,
         date: this.fieldValue.serverTimestamp() as unknown as Timestamp,
      }

      if (livestreamStartDate) {
         details.livestreamStartDate = livestreamStartDate
      }

      if (minutesWatched) {
         details.minutesWatched = this.fieldValue.increment(
            minutesWatched
         ) as unknown as number
      }

      if (lastSecondWatched) {
         details.lastSecondWatched = lastSecondWatched
      }

      return docRef.set(details, { merge: true })
   }

   private async updateRecordingStatsDocument({
      livestreamId,
      livestreamStartDate,
      minutesWatched,
      userId,
      onlyIncrementMinutes,
      usedCredits,
   }: UpdateRecordingStatsProps) {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("recordingStats")
         .doc("stats")

      const details: Omit<LivestreamRecordingDetails, "id"> = {
         livestreamId,
         livestreamStartDate: livestreamStartDate ?? null,
         minutesWatched: this.fieldValue.increment(
            minutesWatched
         ) as unknown as number,
         viewers: this.fieldValue.arrayUnion() as unknown as string[],
         views: this.fieldValue.increment(1) as unknown as number,
      }

      if (usedCredits) {
         // users that bought the recording are also stored in a separated
         // array for analytics purposes
         details.viewersThroughCredits = this.fieldValue.arrayUnion(
            userId
         ) as unknown as string[]
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

   async getPoll(
      livestreamId: string,
      pollId: string
   ): Promise<LivestreamPoll> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .doc(pollId)
         .withConverter(createCompatGenericConverter<LivestreamPoll>())

      const doc = await docRef.get()

      if (!doc.exists) {
         return null
      }

      return doc.data()
   }

   async createPoll(
      livestreamId: string,
      options: LivestreamPoll["options"],
      question: LivestreamPoll["question"]
   ): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .withConverter(createCompatGenericConverter<LivestreamPoll>())
         .doc()

      const details: LivestreamPoll = {
         options,
         question,
         state: "upcoming",
         timestamp: this.fieldValue.serverTimestamp() as unknown as Timestamp,
         voters: [],
         id: docRef.id,
         closedAt: null,
      }

      return docRef.set(details)
   }

   async updatePoll(
      livestreamId: string,
      pollId: string,
      poll: Partial<Pick<LivestreamPoll, "options" | "question" | "state">>
   ): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .withConverter(createCompatGenericConverter<LivestreamPoll>())
         .doc(pollId)

      const updateData: Partial<LivestreamPoll> = {
         ...poll,
         ...(poll.state === "closed" && {
            closedAt: this.fieldValue.serverTimestamp() as unknown as Timestamp,
         }),
      }

      return docRef.update(updateData)
   }

   async markPollAsCurrent(
      livestreamId: string,
      pollId: string
   ): Promise<void> {
      const pollsRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .withConverter(createCompatGenericConverter<LivestreamPoll>())

      const currentPollsRef = pollsRef.where("state", "==", "current")

      const targetPollRef = pollsRef.doc(pollId)

      const currentPollsSnaps = await currentPollsRef.get()

      const batch = this.firestore.batch()

      currentPollsSnaps.docs.forEach((doc) => {
         const updateData: Pick<LivestreamPoll, "state" | "closedAt"> = {
            state: "closed",
            closedAt: this.fieldValue.serverTimestamp() as unknown as Timestamp,
         }
         batch.update(doc.ref, updateData)
      })

      const updateData: Pick<LivestreamPoll, "state"> = {
         state: "current",
      }

      batch.update(targetPollRef, updateData)

      return batch.commit()
   }

   async deletePoll(livestreamId: string, pollId: string): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .doc(pollId)

      return docRef.delete()
   }

   async answerQuestion(
      livestreamId: string,
      questionId: string
   ): Promise<void> {
      const questionsRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .withConverter(createCompatGenericConverter<LivestreamQuestion>())

      const currentQuestionsRef = questionsRef.where("type", "==", "current")
      const targetQuestionRef = questionsRef.doc(questionId)

      const currentQuestionsSnaps = await currentQuestionsRef.get()

      const batch = this.firestore.batch()

      currentQuestionsSnaps.docs.forEach((doc) => {
         const updateData: Pick<LivestreamQuestion, "type"> = {
            type: "done",
         }

         batch.update(doc.ref, updateData)
      })

      const targetQuestionData: Pick<LivestreamQuestion, "type"> = {
         type: "current",
      }

      batch.update(targetQuestionRef, targetQuestionData)

      return batch.commit()
   }

   async markQuestionAsDone(
      livestreamId: string,
      questionId: string
   ): Promise<void> {
      const questionsRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .doc(questionId)

      const updateData: Pick<LivestreamQuestion, "type"> = {
         type: "done",
      }

      return questionsRef.update(updateData)
   }

   async resetAllQuestions(livestreamId: string): Promise<void> {
      const questionsRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .where("type", "!=", "done")
         .withConverter(createCompatGenericConverter<LivestreamQuestion>())

      const batch = this.firestore.batch()

      const questionsSnaps = await questionsRef.get()

      questionsSnaps.docs.forEach((doc) => {
         const updateData: Pick<LivestreamQuestion, "type"> = {
            type: "new",
         }
         batch.update(doc.ref, updateData)
      })

      return batch.commit()
   }

   resetQuestion(livestreamId: string, questionId: string): Promise<void> {
      const questionsRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .doc(questionId)

      const updateData: Pick<LivestreamQuestion, "type"> = {
         type: "new",
      }

      return questionsRef.update(updateData)
   }

   async syncLivestreamMetadata(groupId: string, group: Group): Promise<void> {
      const query = this.eventsOfGroupQuery(groupId)
      if (group.universityCode) return

      const snapshots = await query.get()
      const chunks = chunkArray(snapshots.docs, 450)
      const promises = chunks.map(async (chunk) => {
         const batch = this.firestore.batch()
         chunk.forEach((doc) => {
            const metadataFromHost = getMetaDataFromEventHosts([group])
            const toUpdate: MetaData = {
               companyCountries: metadataFromHost.companyCountries,
               companyIndustries: metadataFromHost.companyIndustries,
               companyTargetedCountries:
                  metadataFromHost.companyTargetedCountries,
               companyTargetedFieldsOfStudies:
                  metadataFromHost.companyTargetedFieldsOfStudies,
               companyTargetedUniversities:
                  metadataFromHost.companyTargetedUniversities,
            }
            batch.update(doc.ref, toUpdate)
         })

         return batch.commit()
      })

      await Promise.allSettled(promises)
   }

   async getUserLivestreamData(
      userId: string,
      limit: number,
      ignoreIds?: string[]
   ): Promise<UserLivestreamData[]> {
      const query = await this.firestore
         .collectionGroup("userLivestreamData")
         .where("user.id", "==", userId)
         .orderBy("participated.date", "desc")
         .limit(limit)

      const snap = await query.get()

      const userStreamDataWithoutIgnoredStreams =
         mapFirestoreDocuments<UserLivestreamData>(snap)?.filter((data) => {
            return !ignoreIds?.includes(data.livestreamId)
         })

      return userStreamDataWithoutIgnoredStreams || []
   }

   async getUserRecordingStats(
      userEmail: string,
      unique: boolean
   ): Promise<RecordingStatsUser[]> {
      const query = this.firestore
         .collectionGroup("recordingStatsUser")
         .where("userId", "==", userEmail)
         .orderBy("date", "desc")

      const data = await query.get()
      const recordingStatsData = mapFirestoreDocuments<RecordingStatsUser>(data)

      const recordingStats = recordingStatsData ?? []

      if (!unique) return recordingStats
      // Filtering the results, to only consider the more recent hourly watched recording
      // Meaning if a user has watched multiple recordings for the same live stream in several hours
      // only the last hour data will be considered
      const filteredStats = recordingStats.filter((stat) => {
         // Find other recording stats for the same user and live stream
         const otherHourViews = recordingStats.filter((recordingStat) => {
            return (
               recordingStat.userId == stat.userId &&
               recordingStat.livestreamId == stat.livestreamId &&
               recordingStat.id != stat.id
            )
         })
         if (otherHourViews.length) {
            // Check if any other recording stats has a more recent date
            const hasMoreRecent = otherHourViews.find((recordingStat) => {
               return recordingStat.date.toMillis() > stat.date.toMillis()
            })
            // Keep if there isn't a more recent recording
            return !hasMoreRecent
         }
         // Keep this recording
         return true
      })

      return filteredStats
   }

   async getUserInteractedLivestreams(
      userId: string,
      limit = 10
   ): Promise<LivestreamEvent[]> {
      // Limit in memory
      const recordingData = await this.getUserRecordingStats(userId, true)
      const userRecordingData = recordingData.slice(0, limit)

      const ignoreIds = userRecordingData.map((data) => data.livestreamId)

      const userLivestreamParticipatingData = await this.getUserLivestreamData(
         userId,
         limit,
         ignoreIds
      )

      const allLivestreamData = userRecordingData
         .map((recording) => {
            return {
               livestreamId: recording.livestreamId,
               date: recording.date,
            }
         })
         .concat(
            userLivestreamParticipatingData.map((participatingData) => {
               return {
                  livestreamId: participatingData.livestreamId,
                  date: participatingData?.participated?.date,
               }
            })
         )

      const sortedLivestreamsIds = allLivestreamData
         .sort((baseLivestreamData, comparisonLivestreamData) => {
            return (
               comparisonLivestreamData.date.toMillis() -
               baseLivestreamData.date.toMillis()
            )
         })
         .slice(0, limit)
         .map((data) => data.livestreamId)

      // Will need to re sort as the query might not respect the order
      const livestreams =
         (await this.getLivestreamsByIds(sortedLivestreamsIds)) || []
      const sortedLivestreams = arraySortByIndex(livestreams, (event) =>
         sortedLivestreamsIds.indexOf(event.id)
      )
      return sortedLivestreams
   }

   async isUserRegistered(
      livestreamId: string,
      userId: string
   ): Promise<boolean> {
      if (!livestreamId || !userId) return false

      const query = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("userLivestreamData")
         .doc(userId)
         .withConverter(createCompatGenericConverter<UserLivestreamData>())

      const snap = await query.get()

      return Boolean(snap.data()?.registered?.date)
   }

   async getCTA(livestreamId: string, ctaId: string): Promise<LivestreamCTA> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("callToActions")
         .doc(ctaId)
         .withConverter(createCompatGenericConverter<LivestreamCTA>())

      const doc = await docRef.get()

      if (!doc.exists) {
         return null
      }

      return doc.data()
   }

   async createCTA(
      livestreamId: string,
      message: LivestreamCTA["message"],
      buttonText: LivestreamCTA["buttonText"],
      buttonURL: LivestreamCTA["buttonURL"]
   ): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("callToActions")
         .withConverter(createCompatGenericConverter<LivestreamCTA>())
         .doc()

      const details: LivestreamCTA = {
         message,
         buttonText,
         buttonURL,
         createdAt: this.fieldValue.serverTimestamp() as unknown as Timestamp,
         id: docRef.id,
         numberOfUsersWhoClickedLink: 0,
         numberOfUsersWhoDismissed: 0,
         active: false,
      }

      return docRef.set(details)
   }

   async updateCTA(
      livestreamId: string,
      ctaId: string,
      cta: Partial<Pick<LivestreamCTA, "message" | "buttonText" | "buttonURL">>
   ): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("callToActions")
         .withConverter(createCompatGenericConverter<LivestreamCTA>())
         .doc(ctaId)

      const updateData: Partial<LivestreamCTA> = {
         ...cta,
      }

      return docRef.update(updateData)
   }

   async toggleActiveCTA(livestreamId: string, ctaId: string): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("callToActions")
         .withConverter(createCompatGenericConverter<LivestreamCTA>())
         .doc(ctaId)

      const ctaSnap = await docRef.get()

      const updateData: Pick<LivestreamCTA, "active" | "activatedAt"> = {
         active: !ctaSnap.data().active,
         activatedAt: this.fieldValue.serverTimestamp() as unknown as Timestamp,
      }

      return docRef.update(updateData)
   }

   async deleteCTA(livestreamId: string, ctaId: string): Promise<void> {
      const docRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("callToActions")
         .doc(ctaId)

      return docRef.delete()
   }

   async updateLivestreamSmsEnabled(livestreamId: string, enabled: boolean) {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)

      return livestreamRef.update({
         smsEnabled: enabled,
      })
   }

   private async handlePromiseAllSettled<T>(
      promises: Promise<T[]>[]
   ): Promise<T[]> {
      const responses = await Promise.allSettled(promises)

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
         .map((r) => (r as PromiseFulfilledResult<T[]>).value)
         .flat()
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
      this.livestreams = this.livestreams?.filter(
         ({ jobs, hasJobs }) => jobs?.length > 0 || hasJobs
      )
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

function getNearestHourTimestamp(date?: Date) {
   const d = date ?? new Date()
   d.setMinutes(d.getMinutes() + 30)
   d.setMinutes(0, 0, 0)

   return d.getTime()
}
