import {
   SerializedSpark,
   SparkPresenter,
   sparkPresenterConverter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import {
   AddSparkSparkData,
   DeleteSparkData,
   GetFeedData,
   LikedSparks,
   RemoveNotificationFromUserData,
   Spark,
   SparkStats,
   UpdateSparkData,
} from "@careerfairy/shared-lib/sparks/sparks"
import {
   SparkClientEventsPayload,
   SparkEventClient,
   SparkSecondWatchedClient,
   SparkSecondsWatchedClientPayload,
} from "@careerfairy/shared-lib/sparks/analytics"
import {
   Query,
   collection,
   doc,
   getDoc,
   getDocs,
   limit,
   orderBy,
   query,
   startAfter,
   where,
   getCountFromServer,
   collectionGroup,
   Timestamp,
   deleteField,
   setDoc,
   PartialWithFieldValue,
} from "firebase/firestore"
import { Functions, httpsCallable } from "firebase/functions"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"
import { DateTime } from "luxon"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Counter } from "@careerfairy/shared-lib/FirestoreCounter"

export class SparksService {
   constructor(private readonly functions: Functions) {}

   /**
    * Create a spark
    * @param data  The spark to create
    * */
   async createSpark(data: AddSparkSparkData) {
      return httpsCallable<AddSparkSparkData, void>(
         this.functions,
         "createSpark_v2"
      )(data)
   }

   /**
    * Update a spark
    * @param data  The spark to update
    * */
   async updateSpark(data: UpdateSparkData) {
      return httpsCallable<UpdateSparkData, void>(
         this.functions,
         "updateSpark_v2"
      )(data)
   }

   /**
    * Deletes a spark and moves it to the deletedSparks collection
    * @param data  The spark to delete
    * */
   async deleteSpark(data: DeleteSparkData) {
      return httpsCallable<DeleteSparkData, void>(
         this.functions,
         "deleteSpark_v2"
      )(data)
   }

   /**
    * Fetch the user's feed of sparks
    * @param userId  The user to fetch the feed for, if not provided, the public feed will be fetched
    * - If the user is not authenticated, the public feed will be fetched
    * - If the user does not have a feed, a feed will be lazily created and returned
    */
   async fetchFeed(data: GetFeedData) {
      const { data: serializedSparks } = await httpsCallable<
         GetFeedData,
         SerializedSpark[]
      >(
         this.functions,
         "getSparksFeed"
      )(data)

      return serializedSparks.map(SparkPresenter.deserialize)
   }
   /**
    * Calls the trackSparkEvents cloud function with the provided data.
    * @param data - The data to send to the cloud function.
    */
   async trackSparkEvents(data: SparkEventClient[]) {
      return httpsCallable<SparkClientEventsPayload, void>(
         this.functions,
         "trackSparkEvents_v2"
      )({
         events: data,
      })
   }

   /**
    * Calls the trackSparkSecondsWatched cloud function every second a user watches a spark.
    * @param data - The data containing the sparkId and the number of seconds watched.
    */

   async trackSparkSecondsWatched(data: SparkSecondWatchedClient[]) {
      return httpsCallable<SparkSecondsWatchedClientPayload, void>(
         this.functions,
         "trackSparkSecondsWatched_v2"
      )({
         events: data,
      })
   }

   /**
    * Fetches the next batch of sparks based on provided options.
    *
    * @param lastSpark - The last retrieved spark to determine the starting point for the next batch.
    *                    If null, the first batch will be retrieved.
    * @param options - The options for the fetch. This can either specify a `userId` or a `groupId`,
    *                  but not both. It also optionally specifies the number of sparks to fetch
    *                  and the categories for which to filter the sparks
    *
    * @returns A promise that resolves to an array of SparkPresenter objects.
    */
   async fetchNextSparks(
      lastSpark: SparkPresenter | Spark | null,
      options: GetFeedData = { userId: null }
   ): Promise<SparkPresenter[]> {
      const { numberOfSparks = 10 } = options

      const db = FirestoreInstance

      // Determine the base query depending on the provided options.
      let baseQuery: Query
      let sortField: "addedToFeedAt" | "publishedAt" = "publishedAt"

      if ("groupId" in options) {
         // Query sparks based on the specified group.
         baseQuery = query(
            collection(db, "sparks"),
            where("group.id", "==", options.groupId!)
         )

         // Check if options specify a userId and that no categories are selected
      } else if (options.userId && !options.sparkCategoryIds?.length) {
         // Query the specified user's sparks feed.
         baseQuery = query(
            collection(db, "userData", options.userId, "sparksFeed")
         )

         // Set the sort field to be the addedToFeedAt field.
         sortField = "addedToFeedAt"
      } else {
         // Query the public sparks feed
         baseQuery = query(collection(db, "sparks"))
      }

      // Filter the sparks by category if provided
      if (options.sparkCategoryIds?.length) {
         baseQuery = query(
            baseQuery,
            where("category.id", "in", options.sparkCategoryIds)
         )
      }

      // Order the results by their publication date in descending order.
      baseQuery = query(
         baseQuery,
         orderBy(sortField, sortField === "publishedAt" ? "desc" : "asc")
      )

      // If a lastSpark is provided, apply pagination logic to start after that spark.
      // Additionally, apply the limit to get only the specified number of sparks.
      baseQuery = query(
         baseQuery,
         ...(lastSpark ? [startAfter(lastSpark[sortField])] : []),
         where("group.publicSparks", "==", true),
         where("published", "==", true),
         limit(numberOfSparks)
      )

      const snapshot = await getDocs(
         baseQuery.withConverter(sparkPresenterConverter)
      )

      // Convert the fetched data to SparkPresenter objects and return.
      return snapshot.docs.map((doc) => doc.data())
   }

   /**
    * Get spark by Id
    *
    * @param sparkId - The id of the spark to fetch
    * */
   async getSparkById(sparkId: string): Promise<SparkPresenter | null> {
      const docRef = doc(FirestoreInstance, "sparks", sparkId)
      const docSnap = await getDoc(
         docRef.withConverter(sparkPresenterConverter)
      )
      if (docSnap.exists()) {
         const data = docSnap.data()
         return data.group.publicSparks && data.published ? data : null
      } else {
         return null
      }
   }

   /**
    * Check if a user has ever seen any Spark
    * @param userId The user to check
    *
    * @returns true if the user has seen the Spark, false otherwise
    **/
   async hasUserSeenAnySpark(userId: string): Promise<boolean> {
      const q = query(
         collectionGroup(FirestoreInstance, "seenSparks"),
         where(`documentType`, "==", "seenSparks"),
         where(`userId`, "==", userId),
         limit(1)
      )

      const r = await getCountFromServer(q)

      return r.data().count > 0
   }

   async markSparkAsSeen(userId: string, sparkId: string) {
      if (!userId) return // Should not be called if not logged in
      return httpsCallable<{ sparkId: string }, void>(
         this.functions,
         "markSparkAsSeenByUser"
      )({ sparkId })
   }

   /**
    * To remove and sync a specific spark notification related to a group from the user SparksNotification subCollection
    *
    * @param data - has the groupId and userId
    */
   async removeAndSyncUserSparkNotification(
      data: RemoveNotificationFromUserData
   ) {
      return httpsCallable<RemoveNotificationFromUserData, void>(
         this.functions,
         "removeAndSyncUserSparkNotification"
      )(data)
   }

   async createUserSparksFeedEventNotifications(userId: string) {
      return httpsCallable<string, void>(
         this.functions,
         "createUserSparksFeedEventNotifications"
      )(userId)
   }

   async fetchPublicSparksNotifications() {
      const q = query(
         collection(FirestoreInstance, "publicSparksNotifications")
      )
      const r = await getDocs(q)
      return r.docs.map((doc) => doc.data())
   }

   /**
    * Toggle the like status of a spark for a user
    *
    * @param userId - The id of the user
    * @param sparkId - The id of the spark
    **/
   async toggleSparkLike(userId: string, sparkId: string) {
      const hasLikedSpark = await this.hasUserLikedSpark(userId, sparkId)

      const toggledLike = !hasLikedSpark

      const currentYear = DateTime.now().year
      const docRef = doc(
         FirestoreInstance,
         "userData",
         userId,
         "likedSparks",
         currentYear.toString()
      ).withConverter(createGenericConverter<LikedSparks>())

      if (toggledLike) {
         // If liked is true, add the sparkId to the sparks map for the current year
         await setDoc<LikedSparks>(
            docRef,
            this.createLikedSparksObject(
               userId,
               sparkId,
               currentYear,
               toggledLike
            ),
            { merge: true }
         )
      } else {
         // If liked is false, remove the sparkId from the sparks map for all years where the user has liked the spark

         const allLikedSparksQuery = query(
            collection(FirestoreInstance, "userData", userId, "likedSparks"),
            where(`sparks.${sparkId}`, "!=", null)
         ).withConverter(createGenericConverter<LikedSparks>())

         const allLikedSparks = await getDocs<LikedSparks>(allLikedSparksQuery)

         const promises = allLikedSparks.docs.map((doc) => {
            const year = parseInt(doc.id)
            const yearRef = doc.ref.withConverter(
               createGenericConverter<LikedSparks>()
            )

            return setDoc<LikedSparks>(
               yearRef,
               this.createLikedSparksObject(userId, sparkId, year, toggledLike),
               { merge: true }
            )
         })

         await Promise.all(promises)
      }

      return toggledLike
   }

   /**
    * Check if a user has liked a specific Spark
    * @param userId - The id of the user
    * @param sparkId - The id of the spark to check
    *
    * @returns true if the user has liked the Spark, false otherwise
    **/
   async hasUserLikedSpark(userId: string, sparkId: string): Promise<boolean> {
      const likedSparksDocRef = query(
         collection(FirestoreInstance, "userData", userId, "likedSparks"),
         where(`sparks.${sparkId}`, "!=", null),
         limit(1)
      )

      const countRef = await getCountFromServer(likedSparksDocRef)

      return countRef.data().count > 0
   }

   incrementSparkCount(
      sparkId: string,
      field: keyof Pick<
         SparkStats,
         | "likes"
         | "impressions"
         | "numberOfCareerPageClicks"
         | "shareCTA"
         | "uniquePlays"
         | "plays"
         | "numberOfCompanyPageClicks"
         | "numberTimesCompletelyWatched"
         | "totalWatchedMinutes"
      >,
      increment: number = 1
   ) {
      const sparkCounter = new Counter(
         FirestoreInstance.doc(`sparkStats/${sparkId}`),
         field
      )

      sparkCounter.incrementBy(increment)
   }

   private createLikedSparksObject(
      userId: string,
      sparkId: string,
      year: number,
      liked: boolean
   ): PartialWithFieldValue<LikedSparks> {
      return {
         documentType: "likedSparks",
         userId,
         id: year.toString(),
         sparks: {
            [sparkId]: liked ? Timestamp.now() : deleteField(),
         },
      }
   }
}

export const sparkService = new SparksService(FunctionsInstance as any)

export default SparksService
