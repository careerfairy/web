import functions = require("firebase-functions")
import {
   FETCH_TYPES,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import { GetGroupTalentEngagementFnArgs } from "@careerfairy/shared-lib/functions/types"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import { type Query } from "firebase-admin/firestore"
import { CallableRequest, onCall } from "firebase-functions/https"
import { array, object, string } from "yup"
import { firestore } from "./api/firestoreAdmin"
import { livestreamsRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { createAdminConverter } from "./util/firestore-admin"

/*
|--------------------------------------------------------------------------
| Functions to calculate group analytics
|--------------------------------------------------------------------------
*/

// cache settings for all functions in this file
const cache = (cacheKeyFn: CacheKeyOnCallFn) =>
   cacheOnCallValues("analytics", cacheKeyFn, 300) // 5min

// cache settings for talent engagement (1 day cache)
const talentEngagementCache = (cacheKeyFn: CacheKeyOnCallFn) =>
   cacheOnCallValues("analytics", cacheKeyFn, 24 * 60 * 60) // 1 day

/**
 * Count unique users who have seen any livestreams of a group that match the group's targeting criteria
 * This includes users who have registered, participated, or joined the talent pool
 * Only accessible by group admins
 * Cache key includes targeting criteria so results update when targeting changes
 *
 * @param data - { groupId: string, targeting: TargetingCriteria } - The group ID and targeting criteria
 * @returns { count: number } - The count of unique users who engaged
 */
export const getGroupTalentEngagement = onCall(
   {
      memory: "512MiB",
   },
   middlewares<GetGroupTalentEngagementFnArgs>(
      dataValidation({
         groupId: string().required(),
         targeting: object({
            countries: array(string()).default([]),
            universities: array(string()).default([]),
            fieldsOfStudy: array(string()).default([]),
         }).required(),
      }),
      userShouldBeGroupAdmin(),
      talentEngagementCache(createTalentEngagementCacheKey),
      async (request) => {
         try {
            const { groupId, targeting } = request.data

            // Step 1: Find livestreams that match the group's targeting
            const { livestreamIds, totalLivestreams, targetedLivestreams } =
               await fetchAndFilterTargetedLivestreams(groupId, targeting)

            // Step 2: Count unique users from targeted livestreams
            const { uniqueUsers, totalInteractions } =
               await countUniqueUsersFromLivestreams(livestreamIds)

            // Step 3: Log results and return count
            functions.logger.info(
               `Group ${groupId} talent engagement count: ${uniqueUsers}`,
               {
                  groupId,
                  totalLivestreams,
                  targetedLivestreams,
                  livestreamCount: targetedLivestreams,
                  totalInteractions,
                  uniqueUsers,
               }
            )

            return { count: uniqueUsers }
         } catch (error) {
            functions.logger.error("Error in getGroupTalentEngagement:", error)
            logAndThrow("Error counting group talent engagement", {
               request,
               error,
            })
         }
      }
   )
)

/**
 * Count total users in the database who match the given targeting criteria
 * This is independent of any specific group and only looks at user demographics
 * Cache key only includes targeting criteria for better cache hit rates
 *
 * @param data - { groupId: string, targeting: TargetingCriteria } - The group ID (for auth) and targeting criteria
 * @returns { total: number } - The total count of users matching the criteria
 */
export const getTotalUsersMatchingTargeting = onCall(
   {
      memory: "512MiB",
   },
   middlewares<{
      groupId: string
      targeting: GetGroupTalentEngagementFnArgs["targeting"]
   }>(
      dataValidation({
         groupId: string().required(),
         targeting: object({
            countries: array(string()).default([]),
            universities: array(string()).default([]),
            fieldsOfStudy: array(string()).default([]),
         }).required(),
      }),
      userShouldBeGroupAdmin(),
      talentEngagementCache(createTotalUsersCacheKey),
      async (request) => {
         try {
            const { targeting } = request.data

            const totalMatchingUsers = await countTotalUsersMatchingTargeting(
               targeting
            )

            functions.logger.info(
               `Total users matching targeting criteria: ${totalMatchingUsers}`,
               {
                  totalMatchingUsers,
                  targeting: {
                     countries: targeting.countries.length,
                     universities: targeting.universities.length,
                     fieldsOfStudy: targeting.fieldsOfStudy.length,
                  },
               }
            )

            return { total: totalMatchingUsers }
         } catch (error) {
            functions.logger.error(
               "Error in getTotalUsersMatchingTargeting:",
               error
            )
            logAndThrow("Error counting total users matching targeting", {
               request,
               error,
            })
         }
      }
   )
)

/**
 * Fetch Group Registration Sources Analytics
 */
export const getRegistrationSources = onCall(
   {
      secrets: ["MERGE_ACCESS_KEY"],
   },
   middlewares(
      dataValidation({
         groupId: string().required(),
         livestreamIds: array(string()).optional(),
         fetchType: string()
            .oneOf([...FETCH_TYPES])
            .optional(),
      }),
      userShouldBeGroupAdmin(),
      cache((request) => registrationSourcesCacheKey(request.data)),
      async (
         request: CallableRequest<{
            groupId: string
            livestreamIds: string[]
            fetchType: (typeof FETCH_TYPES)[number]
         }>
      ) => {
         const type = request.data.fetchType

         let userLivestreamData: UserLivestreamData[] = []
         switch (type) {
            case "ALL_LIVESTREAMS": {
               const livestreams = await livestreamsRepo.getEventsOfGroup(
                  request.data.groupId
               )

               userLivestreamData =
                  await livestreamsRepo.getRegisteredUsersMultipleEvents(
                     livestreams.map((l) => l.id)
                  )

               break
            }

            // fallback to livestreamIds
            default:
               userLivestreamData =
                  await livestreamsRepo.getRegisteredUsersMultipleEvents(
                     request.data.livestreamIds
                  )
         }

         functions.logger.info(
            `Fetched ${userLivestreamData.length} userLivestreamData docs`
         )

         // remove unwanted fields to save bandwidth
         // (smaller responses are more likely to fit in cache due to the 1MB limit)
         const stats: RegistrationSourcesResponseItem[] =
            userLivestreamData.map(RegistrationSourcesResponseItem.serialize)

         return stats
      }
   )
)

/*
|--------------------------------------------------------------------------
| Helper Functions for Talent Engagement
|--------------------------------------------------------------------------
*/

/**
 * Creates a cache key that includes targeting criteria
 */
function createTalentEngagementCacheKey(request: {
   data: GetGroupTalentEngagementFnArgs
}): string[] {
   const { groupId, targeting } = request.data

   // Create a deterministic string from targeting arrays
   const targetingSignature = [
      `countries:${targeting.countries.sort().join(",")}`,
      `universities:${targeting.universities.sort().join(",")}`,
      `fields:${targeting.fieldsOfStudy.sort().join(",")}`,
   ].join("|")

   return ["groupTalentEngagement", groupId, targetingSignature]
}

/**
 * Creates a cache key for total users matching targeting criteria
 */
function createTotalUsersCacheKey(request: {
   data: {
      groupId: string
      targeting: GetGroupTalentEngagementFnArgs["targeting"]
   }
}): string[] {
   const { targeting } = request.data

   // Create a deterministic string from targeting arrays
   const targetingSignature = [
      `countries:${targeting.countries.sort().join(",")}`,
      `universities:${targeting.universities.sort().join(",")}`,
      `fields:${targeting.fieldsOfStudy.sort().join(",")}`,
   ].join("|")

   return ["totalUsersMatchingTargeting", targetingSignature]
}

/**
 * Fetches all group livestreams and filters them by targeting criteria
 */
async function fetchAndFilterTargetedLivestreams(
   groupId: string,
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
) {
   const livestreamsQuery = await firestore
      .collection("livestreams")
      .where("groupIds", "array-contains", groupId)
      .get()

   if (livestreamsQuery.empty) {
      return { livestreamIds: [], totalLivestreams: 0, targetedLivestreams: 0 }
   }

   const hasTargeting =
      targeting.countries.length > 0 ||
      targeting.universities.length > 0 ||
      targeting.fieldsOfStudy.length > 0

   const targetedLivestreams = livestreamsQuery.docs.filter((doc) => {
      if (!hasTargeting) {
         return true // Include all livestreams if no targeting criteria
      }

      const livestream = doc.data()
      let matches = false

      // Check countries
      if (
         targeting.countries.length > 0 &&
         livestream.companyTargetedCountries?.length > 0
      ) {
         matches =
            matches ||
            livestream.companyTargetedCountries.some((country) =>
               targeting.countries.includes(country)
            )
      }

      // Check universities
      if (
         targeting.universities.length > 0 &&
         livestream.companyTargetedUniversities?.length > 0
      ) {
         matches =
            matches ||
            livestream.companyTargetedUniversities.some((university) =>
               targeting.universities.includes(university)
            )
      }

      // Check fields of study
      if (
         targeting.fieldsOfStudy.length > 0 &&
         livestream.companyTargetedFieldsOfStudies?.length > 0
      ) {
         matches =
            matches ||
            livestream.companyTargetedFieldsOfStudies.some((field) =>
               targeting.fieldsOfStudy.includes(field)
            )
      }

      return matches
   })

   return {
      livestreamIds: targetedLivestreams.map((doc) => doc.id),
      totalLivestreams: livestreamsQuery.docs.length,
      targetedLivestreams: targetedLivestreams.length,
   }
}

/**
 * Counts unique users from the provided livestream IDs
 */
async function countUniqueUsersFromLivestreams(
   livestreamIds: string[]
): Promise<{ uniqueUsers: number; totalInteractions: number }> {
   if (livestreamIds.length === 0) {
      return { uniqueUsers: 0, totalInteractions: 0 }
   }

   const chunks = chunkArray(livestreamIds, 10)
   const allUserData: Pick<UserLivestreamData, "userId">[] = []

   for (const chunk of chunks) {
      const userDataQuery = await firestore
         .collectionGroup("userLivestreamData")
         .withConverter(createAdminConverter<UserLivestreamData>())
         .where("livestreamId", "in", chunk)
         .select("userId")
         .get()

      const userData = userDataQuery.docs.map((doc) => ({
         userId: doc.data().userId,
      }))
      allUserData.push(...userData)
   }

   const uniqueUserIds = new Set(allUserData.map((data) => data.userId))

   return {
      uniqueUsers: uniqueUserIds.size,
      totalInteractions: allUserData.length,
   }
}

/**
 * Counts total users in the database who match the given targeting criteria.
 * This queries the userData collection based on user's university country, field of study, and university.
 * Users must match ALL targeting criteria (AND logic), not just one.
 */
async function countTotalUsersMatchingTargeting(
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
): Promise<number> {
   const hasTargeting =
      targeting.countries.length > 0 ||
      targeting.universities.length > 0 ||
      targeting.fieldsOfStudy.length > 0

   if (!hasTargeting) {
      // If no targeting criteria, count all users
      const countQuery = await firestore.collection("userData").count().get()
      return countQuery.data().count
   }

   // Since Firestore doesn't support multiple "in" queries in a single query,
   // we'll use one criteria for the query and filter ALL others in memory
   let query: Query = firestore.collection("userData")

   // Choose the most selective targeting criteria for the Firestore query
   // Priority: universities > countries > fieldsOfStudy (most to least selective)
   if (targeting.universities.length > 0) {
      query = query.where("university.code", "in", targeting.universities)
   } else if (targeting.countries.length > 0) {
      query = query.where("universityCountryCode", "in", targeting.countries)
   } else if (targeting.fieldsOfStudy.length > 0) {
      query = query.where("fieldOfStudy.id", "in", targeting.fieldsOfStudy)
   }

   // Only select the fields we need for filtering
   const snapshot = await query
      .select("universityCountryCode", "university", "fieldOfStudy")
      .get()

   // Filter in memory for ALL targeting criteria (AND logic)
   const matchingUsers = snapshot.docs.filter((doc) => {
      const userData = doc.data()
      let matches = true

      // Check ALL targeting criteria - user must match all of them

      // Check countries
      if (targeting.countries.length > 0) {
         matches =
            matches &&
            targeting.countries.includes(userData.universityCountryCode)
      }

      // Check universities
      if (targeting.universities.length > 0) {
         matches =
            matches &&
            targeting.universities.includes(userData.university?.code)
      }

      // Check fields of study
      if (targeting.fieldsOfStudy.length > 0) {
         matches =
            matches &&
            targeting.fieldsOfStudy.includes(userData.fieldOfStudy?.id)
      }

      return matches
   })

   return matchingUsers.length
}
