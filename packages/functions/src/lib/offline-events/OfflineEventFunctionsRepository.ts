import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import {
   OfflineEvent,
   OfflineEventAction,
   OfflineEventStats,
   OfflineEventStatsAction,
   OfflineEventUserStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { UserData, UserPublicData } from "@careerfairy/shared-lib/users"
import { Firestore, Timestamp } from "firebase-admin/firestore"
import { FunctionsLogger } from "../../util"
import { createAdminConverter } from "../../util/firestore-admin"
import { buildOfflineEventStatsUpdateData } from "./util"

export interface IOfflineEventFunctionsRepository {
   syncGroupDataToOfflineEvent(groupId: string, group: Group): Promise<void>

   /**
    * Shared implementation for tracking offline event actions (view or click).
    * Creates action record, upserts user stats with appropriate timestamp,
    * and updates general + segmented analytics (by university, country, field of study).
    * Handles migration when users change their profile data.
    */
   trackOfflineEventAction(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null,
      actionType: OfflineEventStatsAction
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

   async trackOfflineEventAction(
      offlineEventId: string,
      user: UserData,
      utm: UTMParams | null,
      actionType: OfflineEventStatsAction
   ): Promise<void> {
      // Define configuration based on action type
      const config =
         actionType === OfflineEventStatsAction.View
            ? {
                 timestampField: "lastSeenAt" as const,
                 segmentedStatsSuffix: "TalentReached" as const,
              }
            : {
                 timestampField: "listClickedAt" as const,
                 segmentedStatsSuffix: "RegisterClicks" as const,
              }

      return this.firestore.runTransaction(async (transaction) => {
         const userStatsRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(user.authId)
            .withConverter(createAdminConverter<OfflineEventUserStats>())

         const statsRef = this.firestore
            .collection("offlineEventStats")
            .doc(offlineEventId)
            .withConverter(createAdminConverter<OfflineEventStats>())

         const actionRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(user.authId)
            .collection("offlineEventActions")
            .withConverter(createAdminConverter<OfflineEventAction>())
            .doc()

         // Get existing user stats and offline event
         const userStatsSnap = await transaction.get(userStatsRef)
         const eventRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .withConverter(createAdminConverter<OfflineEvent>())
         const eventSnap = await transaction.get(eventRef)
         const offlineEvent = eventSnap.data()

         if (!offlineEvent) {
            throw new Error(`Offline event ${offlineEventId} not found`)
         }

         const userStatsData = userStatsSnap.data()

         // Upsert user stats with appropriate timestamp
         transaction.set(userStatsRef, {
            ...userStatsData,
            user,
            offlineEvent,
            [config.timestampField]: {
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
            type: actionType,
            utm,
            createdAt: Timestamp.now(),
         })

         // Build update data using the extracted testable function
         const updateData = buildOfflineEventStatsUpdateData(
            actionType,
            userStatsData || null,
            user,
            config.segmentedStatsSuffix
         )

         transaction.update(statsRef, updateData)
      })
   }
}
