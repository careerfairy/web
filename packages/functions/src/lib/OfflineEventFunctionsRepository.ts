import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import {
   OfflineEvent,
   OfflineEventStatsAction,
   OfflineEventUserStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { UserPublicData } from "@careerfairy/shared-lib/users"
import { FieldValue, Firestore, Timestamp } from "firebase-admin/firestore"
import { FunctionsLogger } from "src/util"

export interface IOfflineEventFunctionsRepository {
   syncGroupDataToOfflineEvent(groupId: string, group: Group): Promise<void>
   trackOfflineEventView(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null
   ): Promise<void>

   trackOfflineEventClick(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null
   ): Promise<void>
}

export class OfflineEventFunctionsRepository
   extends BaseFirebaseRepository
   implements IOfflineEventFunctionsRepository
{
   constructor(
      readonly firestore: Firestore,
      readonly logger: FunctionsLogger
   ) {
      super()
   }

   async syncGroupDataToOfflineEvent(
      groupId: string,
      group: Group
   ): Promise<void> {
      const offlineEventsSnap = await this.firestore
         .collection("offlineEvents")
         .where("group.id", "==", groupId)
         .get()

      const batch = this.firestore.batch()
      const publicGroup = pickPublicDataFromGroup(group)

      offlineEventsSnap.forEach((doc) => {
         const updateData: Pick<OfflineEvent, "group"> = {
            group: publicGroup,
         }

         batch.update(doc.ref, updateData)
      })

      await batch.commit()
   }

   /**
    * Tracks when a user views an offline event (opens the dialog)
    * - Upserts OfflineEventUserStats with lastSeenAt
    * - Creates an OfflineEventAction with type "view"
    * - Updates OfflineEventStats to increment totalNumberOfTalentReached and uniqueNumberOfTalentReached if first view
    * @param offlineEventId - The ID of the offline event
    * @param user - The user's public data
    * @param utm - UTM parameters from cookies
    */
   async trackOfflineEventView(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null
   ): Promise<void> {
      return this.firestore.runTransaction(async (transaction) => {
         const userStatsRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(user.authId)

         const statsRef = this.firestore
            .collection("offlineEventStats")
            .doc(offlineEventId)

         const actionRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(user.authId)
            .collection("offlineEventActions")
            .doc()

         // Check if user has viewed before
         const userStatsSnap = await transaction.get(userStatsRef)
         const isFirstView =
            !userStatsSnap.exists || !userStatsSnap.data()?.lastSeenAt?.date

         // Get the offline event to update stats with user segmentation
         const eventRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
         const eventSnap = await transaction.get(eventRef)
         const offlineEvent = eventSnap.data() as OfflineEvent

         if (!offlineEvent) {
            throw new Error(`Offline event ${offlineEventId} not found`)
         }

         const userStatsData = userStatsSnap.data() as
            | OfflineEventUserStats
            | undefined

         // Upsert user stats with lastSeenAt
         transaction.set(userStatsRef, {
            ...userStatsData,
            user,
            offlineEvent,
            lastSeenAt: {
               date: Timestamp.now(),
               utm,
            },
            createdAt: userStatsData?.createdAt
               ? userStatsData?.createdAt
               : Timestamp.now(),
            documentType: "offlineEventUserStats",
            id: userStatsRef.id,
         })

         // Create action record
         transaction.set(actionRef, {
            id: actionRef.id,
            documentType: "offlineEventAction",
            user,
            offlineEventId,
            type: OfflineEventStatsAction.View,
            utm,
            createdAt: Timestamp.now(),
         })

         transaction.update(statsRef, {
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
            ...(isFirstView && {
               "generalStats.uniqueNumberOfTalentReached":
                  FieldValue.increment(1),
            }),
         })
      })
   }

   /**
    * Tracks when a user clicks the register button on an offline event
    * - Upserts OfflineEventUserStats with listClickedAt
    * - Creates an OfflineEventAction with type "click"
    * - Updates OfflineEventStats to increment totalNumberOfRegisterClicks and totalNumberOfUniqueRegisterClicks if first click
    * @param offlineEventId - The ID of the offline event
    * @param user - The user's public data
    * @param utm - UTM parameters from cookies
    */
   async trackOfflineEventClick(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null
   ): Promise<void> {
      return this.firestore.runTransaction(async (transaction) => {
         const userStatsRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(user.authId)

         const statsRef = this.firestore
            .collection("offlineEventStats")
            .doc(offlineEventId)

         const actionRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(user.authId)
            .collection("offlineEventActions")
            .doc()

         // Check if user has clicked before
         const userStatsSnap = await transaction.get(userStatsRef)
         const isFirstClick =
            !userStatsSnap.exists || !userStatsSnap.data()?.listClickedAt?.date

         // Get the offline event to update stats
         const eventRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)

         const eventSnap = await transaction.get(eventRef)
         const offlineEvent = eventSnap.data() as OfflineEvent

         if (!offlineEvent) {
            throw new Error(`Offline event ${offlineEventId} not found`)
         }

         const userStatsData = userStatsSnap.data() as
            | OfflineEventUserStats
            | undefined

         // Upsert user stats with listClickedAt
         transaction.set(
            userStatsRef,
            {
               ...userStatsData,
               user,
               offlineEvent,
               listClickedAt: {
                  date: Timestamp.now(),
                  utm,
               },
               createdAt: userStatsData?.createdAt
                  ? userStatsData?.createdAt
                  : Timestamp.now(),
               documentType: "offlineEventUserStats",
               id: userStatsRef.id,
            },
            { merge: true }
         )

         // Create action record
         transaction.set(actionRef, {
            id: actionRef.id,
            documentType: "offlineEventAction",
            user,
            offlineEventId,
            type: OfflineEventStatsAction.Click,
            utm,
            createdAt: Timestamp.now(),
         })

         transaction.update(statsRef, {
            "generalStats.totalNumberOfRegisterClicks": FieldValue.increment(1),
            ...(isFirstClick && {
               "generalStats.totalNumberOfUniqueRegisterClicks":
                  FieldValue.increment(1),
            }),
         })
      })
   }
}
