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
import { UserData } from "@careerfairy/shared-lib/users"
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
    * Supports both authenticated users and anonymous users (via fingerprint).
    *
    * @param offlineEventId - The ID of the offline event
    * @param userIdentifier - Either authId (for authenticated users) or fingerprint (for anonymous users)
    * @param userData - User data (null for anonymous users)
    * @param utm - UTM parameters
    * @param actionType - The type of action (View or Click)
    */
   trackOfflineEventAction(
      offlineEventId: string,
      userIdentifier: string,
      userData: UserData | null,
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
      userIdentifier: string,
      userData: UserData | null,
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

      const isAnonymous = !userData

      return this.firestore.runTransaction(async (transaction) => {
         const userStatsRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(userIdentifier)
            .withConverter(createAdminConverter<OfflineEventUserStats>())

         const statsRef = this.firestore
            .collection("offlineEventStats")
            .doc(offlineEventId)
            .withConverter(createAdminConverter<OfflineEventStats>())

         const actionRef = this.firestore
            .collection("offlineEvents")
            .doc(offlineEventId)
            .collection("offlineEventUserStats")
            .doc(userIdentifier)
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

         // Get existing data or create new object with both properties initialized to null
         const userStatsData: OfflineEventUserStats = userStatsSnap.exists
            ? userStatsSnap.data()
            : {
                 id: userStatsRef.id,
                 documentType: "offlineEventUserStats",
                 user: userData,
                 isAnonymous,
                 offlineEvent,
                 lastSeenAt: null,
                 listClickedAt: null,
                 createdAt: Timestamp.now(),
              }

         transaction.set(userStatsRef, {
            ...userStatsData,
            user: userData,
            isAnonymous,
            offlineEvent,
            // Update the current action's timestamp, preserve the other
            [config.timestampField]: {
               date: Timestamp.now(),
               utm,
            },
         })

         // Create action record
         transaction.set(actionRef, {
            id: actionRef.id,
            documentType: "offlineEventAction",
            user: userData,
            isAnonymous,
            offlineEventId,
            type: actionType,
            utm,
            createdAt: Timestamp.now(),
         })

         // Build update data using the extracted testable function
         // For anonymous users, pass null userData so segmented stats are not updated
         const updateData = buildOfflineEventStatsUpdateData(
            actionType,
            userStatsData || null,
            userData,
            config.segmentedStatsSuffix
         )

         transaction.update(statsRef, updateData)
      })
   }
}
