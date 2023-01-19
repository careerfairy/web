import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import type { OperationsToMake } from "./stats"

import { createCompatGenericConverter } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

import {
   createLiveStreamStatsDoc,
   LiveStreamStats,
} from "@careerfairy/shared-lib/dist/livestreams/stats"
import type { Change } from "firebase-functions"
import { firestore } from "firebase-admin"
import DocumentSnapshot = firestore.DocumentSnapshot

export interface ILivestreamFunctionsRepository extends ILivestreamRepository {
   /**
    * Get all registered users for the given livestream ids
    * @param livestreamIds
    */
   getRegisteredUsersMultipleEvents(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]>

   /**
    * Get all the Non Attendees users for a specific livestream
    * @param livestreamId
    */
   getNonAttendees(livestreamId: string): Promise<UserLivestreamData[]>

   updateLiveStreamStats(
      livestreamId: string,
      operationsToMake: OperationsToMake
   ): Promise<void>

   syncLiveStreamStatsWithLivestream(
      snapshotChange: Change<DocumentSnapshot>
   ): Promise<void>
}

export class LivestreamFunctionsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamFunctionsRepository
{
   async getRegisteredUsersMultipleEvents(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]> {
      const promises: Promise<UserLivestreamData[]>[] = []

      for (const livestreamId of livestreamIds) {
         promises.push(this.getLivestreamUsers(livestreamId, "registered"))
      }

      const promiseResults = await Promise.allSettled(promises)

      // map the promises responses into a single array
      return (
         promiseResults
            .map((result) => {
               if (result.status === "fulfilled") {
                  return result.value
               } else {
                  console.warn(
                     "Failed to get the UserLivestreamData promise",
                     result.reason
                  )
                  // best effort, ignore the failed ones for now
                  return null
               }
            })
            // remove nulls
            .filter((user) => user)
            .flatMap((array) => array)
      )
   }

   async getNonAttendees(livestreamId: string): Promise<UserLivestreamData[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("userLivestreamData")
         .where("livestreamId", "==", livestreamId)
         .where("registered", "!=", null)
         .where("participated", "==", null)
         .get()

      if (!querySnapshot.empty) {
         const nonAttendeesUsers = querySnapshot.docs?.map(
            (doc) => doc.data() as UserLivestreamData
         )
         return nonAttendeesUsers
      }

      return []
   }

   async updateLiveStreamStats(
      livestreamId: string,
      operationsToMake: OperationsToMake
   ): Promise<void> {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .withConverter(createCompatGenericConverter<LivestreamEvent>())

      const statsRef = livestreamRef
         .collection("stats")
         .doc("livestreamStats")
         .withConverter(createCompatGenericConverter<LiveStreamStats>())

      return this.firestore.runTransaction(async (transaction) => {
         const statsDoc = await transaction.get(statsRef)

         if (!statsDoc.exists) {
            // Create the stats document
            const livestreamDoc = await transaction.get(livestreamRef)

            if (!livestreamDoc.exists) {
               return // Livestream was deleted, no need to update the stats
            }

            const statsDoc = createLiveStreamStatsDoc(
               livestreamDoc.data(),
               statsRef.id
            )
            transaction.set(statsRef, statsDoc)
         }

         // We have to use an update method here because the set method does not support nested updates/operations
         transaction.update(statsRef, operationsToMake)
      })
   }

   syncLiveStreamStatsWithLivestream(
      snapshotChange: Change<DocumentSnapshot>
   ): Promise<void> {
      const latestLivestreamDoc = snapshotChange.after

      return this.firestore.runTransaction(async (transaction) => {
         const statsRef = this.firestore
            .collection("livestreams")
            .doc(latestLivestreamDoc.id)
            .collection("stats")
            .doc("livestreamStats")
            .withConverter(createCompatGenericConverter<LiveStreamStats>())

         if (!latestLivestreamDoc.exists) {
            // Livestream was deleted, delete the stats document
            transaction.delete(statsRef)
            return
         }

         const statsDoc = await transaction.get(statsRef)

         const livestream = this.addIdToDoc<LivestreamEvent>(
            latestLivestreamDoc as any
         )

         if (!statsDoc.exists) {
            // Create the stats document
            const statsDoc = createLiveStreamStatsDoc(livestream, statsRef.id)
            transaction.set(statsRef, statsDoc)
         } else {
            const toUpdate: Pick<LiveStreamStats, "livestream"> = {
               livestream: livestream,
            }

            transaction.update(statsRef, toUpdate)
         }
      })
   }
}
