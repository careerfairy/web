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
import {
   FieldValue,
   Firestore,
   Timestamp,
   UpdateData,
} from "firebase-admin/firestore"
import { FunctionsLogger } from "../util"
import { createAdminConverter } from "../util/firestore-admin"

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
                 totalStatsField: "totalNumberOfTalentReached" as const,
                 uniqueStatsField: "uniqueNumberOfTalentReached" as const,
                 segmentedStatsSuffix: "TalentReached" as const,
              }
            : {
                 timestampField: "listClickedAt" as const,
                 totalStatsField: "totalNumberOfRegisterClicks" as const,
                 uniqueStatsField: "uniqueNumberOfRegisterClicks" as const,
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

         // Check if user has performed this action before
         const userStatsSnap = await transaction.get(userStatsRef)
         const isFirstAction =
            !userStatsSnap.exists ||
            !userStatsSnap.data()?.[config.timestampField]?.date

         // Get the offline event to update stats
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

         // Check if user has changed their university, country, or field of study
         const previousUser = userStatsData?.user
         const hasChangedUniversity =
            previousUser?.university?.code &&
            user.university?.code &&
            previousUser.university.code !== user.university.code
         const hasChangedCountry =
            previousUser?.universityCountryCode &&
            user.universityCountryCode &&
            previousUser.universityCountryCode !== user.universityCountryCode
         const hasChangedFieldOfStudy =
            previousUser?.fieldOfStudy?.id &&
            user.fieldOfStudy?.id &&
            previousUser.fieldOfStudy.id !== user.fieldOfStudy.id

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

         // Build update data for general and segmented stats
         const updateData: UpdateData<OfflineEventStats> = {
            [`generalStats.${config.totalStatsField}`]: FieldValue.increment(1),
            ...(isFirstAction && {
               [`generalStats.${config.uniqueStatsField}`]:
                  FieldValue.increment(1),
            }),
            updatedAt: Timestamp.now(),
         }

         // Handle university stats migration if user changed university
         if (hasChangedUniversity && previousUser?.university?.code) {
            const oldUniversityCode = previousUser.university.code
            // Decrement unique count from old university
            updateData[
               `universityStats.${oldUniversityCode}.uniqueNumberOf${config.segmentedStatsSuffix}`
            ] = FieldValue.increment(-1)
         }

         // Update university stats if available
         if (user.university?.code) {
            const universityCode = user.university.code
            updateData[
               `universityStats.${universityCode}.totalNumberOf${config.segmentedStatsSuffix}`
            ] = FieldValue.increment(1)
            // Increment unique if first action OR if migrating from another university
            if (isFirstAction || hasChangedUniversity) {
               updateData[
                  `universityStats.${universityCode}.uniqueNumberOf${config.segmentedStatsSuffix}`
               ] = FieldValue.increment(1)
            }
         }

         // Handle country stats migration if user changed country
         if (hasChangedCountry && previousUser?.universityCountryCode) {
            const oldCountryCode = previousUser.universityCountryCode
            // Decrement unique count from old country
            updateData[
               `countryStats.${oldCountryCode}.uniqueNumberOf${config.segmentedStatsSuffix}`
            ] = FieldValue.increment(-1)
         }

         // Update country stats if available
         if (user.universityCountryCode) {
            const countryCode = user.universityCountryCode
            updateData[
               `countryStats.${countryCode}.totalNumberOf${config.segmentedStatsSuffix}`
            ] = FieldValue.increment(1)
            // Increment unique if first action OR if migrating from another country
            if (isFirstAction || hasChangedCountry) {
               updateData[
                  `countryStats.${countryCode}.uniqueNumberOf${config.segmentedStatsSuffix}`
               ] = FieldValue.increment(1)
            }
         }

         // Handle field of study stats migration if user changed field of study
         if (hasChangedFieldOfStudy && previousUser?.fieldOfStudy?.id) {
            const oldFieldOfStudyId = previousUser.fieldOfStudy.id
            // Decrement unique count from old field of study
            updateData[
               `fieldOfStudyStats.${oldFieldOfStudyId}.uniqueNumberOf${config.segmentedStatsSuffix}`
            ] = FieldValue.increment(-1)
         }

         // Update field of study stats if available
         if (user.fieldOfStudy?.id) {
            const fieldOfStudyId = user.fieldOfStudy.id
            updateData[
               `fieldOfStudyStats.${fieldOfStudyId}.totalNumberOf${config.segmentedStatsSuffix}`
            ] = FieldValue.increment(1)
            // Increment unique if first action OR if migrating from another field of study
            if (isFirstAction || hasChangedFieldOfStudy) {
               updateData[
                  `fieldOfStudyStats.${fieldOfStudyId}.uniqueNumberOf${config.segmentedStatsSuffix}`
               ] = FieldValue.increment(1)
            }
         }

         transaction.update(statsRef, updateData)
      })
   }
}
