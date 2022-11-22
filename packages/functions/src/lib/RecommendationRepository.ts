import {
   getEarliestEventBufferTime,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { mapFirestoreAdminSnapshots } from "../util"
import { UserData } from "@careerfairy/shared-lib/dist/users"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Log } from "@careerfairy/shared-lib/dist/utils/decorators"

type FirebaseAdmin = typeof import("firebase-admin") // This only imports the types at compile time and not the actual library at runtime

export interface IRecommendationRepository {
   getRecommendEventsBasedOnUserInterests(
      user: UserData,
      limit?: number
   ): Promise<LivestreamEvent[] | null>

   getRecommendEventsBasedOnUserFieldOfStudy(
      user: UserData,
      limit: number
   ): Promise<LivestreamEvent[] | null>
}

export class RecommendationRepository implements IRecommendationRepository {
   constructor(private firestoreAdmin: FirebaseAdmin["firestore"], ranker) {}

   @Log()
   async getRecommendEventsBasedOnUserInterests(
      user: UserData,
      limit = 10
   ): Promise<LivestreamEvent[] | null> {
      let query = this.firestoreAdmin()
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)

      console.log("-> user.interestsIds", user.interestsIds)

      if (user.interestsIds?.length) {
         query = query.where(
            "interestsIds",
            "array-contains-any",
            user.interestsIds
         )
      }

      query = query.orderBy("start", "asc").limit(limit)

      const snapshots = await query.get()

      return mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots)
   }

   @Log()
   async getRecommendEventsBasedOnUserFieldOfStudy(
      user: UserData,
      limit = 10
   ): Promise<LivestreamEvent[] | null> {
      let query = this.firestoreAdmin()
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)

      console.log("-> user.fieldOfStudy", user.fieldOfStudy)

      if (user.fieldOfStudy) {
         query = query.where(
            "targetFieldsOfStudy",
            "array-contains",
            user.fieldOfStudy
         )
      }

      query = query.orderBy("start", "asc").limit(limit)

      const snapshots = await query.get()

      return mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots)
   }
}
