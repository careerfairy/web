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
      const { data: sparks } = await httpsCallable<
         GetFeedData,
         SerializedSpark[]
      >(
         this.functions,
         "getSparksFeed"
      )(data)

      return sparks.map(SparkPresenter.deserialize)
   }

   /**
    * Fetch the next batch of sparks
    * @param lastSpark  The last retrieved spark to determine the starting point for the next batch
    * If null, the first batch will be retrieved
    *
    * @param options - The options for the fetch
    * */
   async fetchNextSparks(
      lastSpark: SparkPresenter | Spark | null,
      options: FetchNextSparkOptions = {
         userId: null,
      }
   ): Promise<SparkPresenter[]> {
      const { numberOfSparks = 10 } = options

      const db = FirestoreInstance

      // Starting with base collection.
      let baseQuery: Query

      if ("groupId" in options) {
         // If a group (company) is specified.
         baseQuery = query(
            collection(db, "sparks"),
            where("group.id", "==", options.groupId) // Adjust the field path as necessary.
         )
      } else if ("userId" in options) {
         // If a user is specified.
         baseQuery = query(
            collection(db, "userData", options.userId, "sparksFeed")
         )
      } else {
         // If no user or group is specified, then use the public feed.
         baseQuery = query(collection(db, "sparks"))
      }

      // Apply order.
      baseQuery = query(baseQuery, orderBy("publishedAt", "desc"))

      // Apply the limit and startAfter if a lastSpark is provided.
      if (lastSpark) {
         baseQuery = query(
            baseQuery,
            startAfter(lastSpark.publishedAt),
            limit(numberOfSparks)
         )
      } else {
         baseQuery = query(baseQuery, limit(numberOfSparks))
      }

      const snapshot = await getDocs(
         baseQuery.withConverter(sparkPresenterConverter)
      )

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
}

export type FetchNextSparkOptions = {
   /**
    * The number of sparks to fetch (default: 10)
    */
   numberOfSparks?: number
} & GetFeedData

export const sparkService = new SparksService(FunctionsInstance as any)

export default SparksService
