import {
   SerializedSpark,
   SparkPresenter,
   sparkPresenterConverter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import {
   AddSparkSparkData,
   DeleteSparkData,
   GetFeedData,
   Spark,
   UpdateSparkData,
} from "@careerfairy/shared-lib/sparks/sparks"
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
} from "firebase/firestore"
import { Functions, httpsCallable } from "firebase/functions"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"

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
    * Fetches the next batch of sparks based on provided options.
    *
    * @param lastSpark - The last retrieved spark to determine the starting point for the next batch.
    *                    If null, the first batch will be retrieved.
    * @param options - The options for the fetch. This can either specify a `userId` or a `groupId`,
    *                  but not both. It also optionally specifies the number of sparks to fetch.
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

         // Check if options specify a userId and ensure it's not null.
      } else if (options.userId) {
         // Query the specified user's sparks feed.
         baseQuery = query(
            collection(db, "userData", options.userId, "sparksFeed")
         )

         // Set the sort field to be the addedToFeedAt field.
         sortField = "addedToFeedAt"
      } else {
         // If neither userId nor groupId are specified, query the public sparks feed.
         baseQuery = query(collection(db, "sparks"))
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
         return docSnap.data()
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
}

export const sparkService = new SparksService(FunctionsInstance as any)

export default SparksService
