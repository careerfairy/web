import {
   OfflineEventStats,
   OfflineEventStatsAction,
   OfflineEventUserStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { UserData } from "@careerfairy/shared-lib/users"
import { FieldValue, Timestamp, UpdateData } from "firebase-admin/firestore"

/**
 * Configuration type for action-specific field names and stat suffixes
 */
type ActionConfig = {
   timestampField: "lastSeenAt" | "listClickedAt"
   totalStatsField: "totalNumberOfTalentReached" | "totalNumberOfRegisterClicks"
   uniqueStatsField:
      | "uniqueNumberOfTalentReached"
      | "uniqueNumberOfRegisterClicks"
   segmentedStatsSuffix: "TalentReached" | "RegisterClicks"
}

/**
 * Builds the update data object for OfflineEventStats based on action type and user changes.
 * This function is exported for testing purposes.
 *
 * @param actionType - The type of action (View or Click)
 * @param existingUserStats - The existing user stats (null if first action)
 * @param user - The current user data
 * @param segmentedStatsSuffix - The suffix for segmented stats
 * @returns UpdateData object with FieldValue.increment() operations
 */
export function buildOfflineEventStatsUpdateData(
   actionType: OfflineEventStatsAction,
   existingUserStats: Partial<OfflineEventUserStats> | null,
   user: UserData,
   segmentedStatsSuffix: "TalentReached" | "RegisterClicks"
): UpdateData<OfflineEventStats> {
   // Define configuration based on action type
   const config: ActionConfig =
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

   // Check if user has performed this action before
   const isFirstAction =
      !existingUserStats || !existingUserStats?.[config.timestampField]?.date

   // Check if user has changed their university, country, or field of study
   const previousUser = existingUserStats?.user
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

   // Build update data for general and segmented stats
   const updateData: UpdateData<OfflineEventStats> = {
      [`generalStats.${config.totalStatsField}`]: FieldValue.increment(1),
      ...(isFirstAction && {
         [`generalStats.${config.uniqueStatsField}`]: FieldValue.increment(1),
      }),
      updatedAt: Timestamp.now(),
   }

   // Handle university stats migration if user changed university
   if (hasChangedUniversity && previousUser?.university?.code) {
      const oldUniversityCode = previousUser.university.code
      // Decrement unique count from old university
      updateData[
         `universityStats.${oldUniversityCode}.uniqueNumberOf${segmentedStatsSuffix}`
      ] = FieldValue.increment(-1)
   }

   // Update university stats if available
   if (user.university?.code) {
      const universityCode = user.university.code
      updateData[
         `universityStats.${universityCode}.totalNumberOf${segmentedStatsSuffix}`
      ] = FieldValue.increment(1)
      // Increment unique if first action OR if migrating from another university
      if (isFirstAction || hasChangedUniversity) {
         updateData[
            `universityStats.${universityCode}.uniqueNumberOf${segmentedStatsSuffix}`
         ] = FieldValue.increment(1)
      }
   }

   // Handle country stats migration if user changed country
   if (hasChangedCountry && previousUser?.universityCountryCode) {
      const oldCountryCode = previousUser.universityCountryCode
      // Decrement unique count from old country
      updateData[
         `countryStats.${oldCountryCode}.uniqueNumberOf${segmentedStatsSuffix}`
      ] = FieldValue.increment(-1)
   }

   // Update country stats if available
   if (user.universityCountryCode) {
      const countryCode = user.universityCountryCode
      updateData[
         `countryStats.${countryCode}.totalNumberOf${segmentedStatsSuffix}`
      ] = FieldValue.increment(1)
      // Increment unique if first action OR if migrating from another country
      if (isFirstAction || hasChangedCountry) {
         updateData[
            `countryStats.${countryCode}.uniqueNumberOf${segmentedStatsSuffix}`
         ] = FieldValue.increment(1)
      }
   }

   // Handle field of study stats migration if user changed field of study
   if (hasChangedFieldOfStudy && previousUser?.fieldOfStudy?.id) {
      const oldFieldOfStudyId = previousUser.fieldOfStudy.id
      // Decrement unique count from old field of study
      updateData[
         `fieldOfStudyStats.${oldFieldOfStudyId}.uniqueNumberOf${segmentedStatsSuffix}`
      ] = FieldValue.increment(-1)
   }

   // Update field of study stats if available
   if (user.fieldOfStudy?.id) {
      const fieldOfStudyId = user.fieldOfStudy.id
      updateData[
         `fieldOfStudyStats.${fieldOfStudyId}.totalNumberOf${segmentedStatsSuffix}`
      ] = FieldValue.increment(1)
      // Increment unique if first action OR if migrating from another field of study
      if (isFirstAction || hasChangedFieldOfStudy) {
         updateData[
            `fieldOfStudyStats.${fieldOfStudyId}.uniqueNumberOf${segmentedStatsSuffix}`
         ] = FieldValue.increment(1)
      }
   }

   return updateData
}
