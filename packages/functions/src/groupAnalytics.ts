import functions = require("firebase-functions")
import {
   FETCH_TYPES,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import { GetGroupTalentEngagementFnArgs } from "@careerfairy/shared-lib/functions/types"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import { type Query } from "firebase-admin/firestore"
import { CallableRequest, HttpsError, onCall } from "firebase-functions/https"
import { array, object, string } from "yup"
import { firestore } from "./api/firestoreAdmin"
import { livestreamsRepo } from "./api/repositories"
import { logError } from "./lib/validations"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"

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
 * Count unique users who have registered for the group's livestreams AND match the targeting criteria
 * This takes ALL group livestreams and filters the registered users based on targeting
 * Only accessible by group admins
 * Cache key includes targeting criteria so results update when targeting changes
 *
 * @param data - { groupId: string, targeting: TargetingCriteria } - The group ID and targeting criteria
 * @returns { count: number } - The count of unique users who registered and match targeting
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

            // Step 1: Get all livestreams for the group
            const livestreams = await livestreamsRepo.getEventsOfGroup(groupId)
            const livestreamIds = livestreams.map((l) => l.id)

            // Step 2: Count registered users who match targeting criteria
            const { uniqueUsers, totalInteractions } =
               await countRegisteredUsersMatchingTargeting(
                  livestreamIds,
                  targeting
               )

            // Step 3: Log results and return count
            functions.logger.info(
               `Group ${groupId} talent engagement count: ${uniqueUsers}`,
               {
                  groupId,
                  livestreamCount: livestreamIds.length,
                  totalInteractions,
                  uniqueUsers,
               }
            )

            return { count: uniqueUsers }
         } catch (error) {
            logError(error, request)

            throw new HttpsError(
               "internal",
               "Error counting group talent engagement"
            )
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
            logError(error, request)
            throw new HttpsError(
               "internal",
               "Error counting total users matching targeting"
            )
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
 * Helper function to check if a user matches the targeting criteria
 * @param user - User data with targeting-related fields
 * @param targeting - The targeting criteria to match against
 * @returns true if user matches ALL targeting criteria (AND logic)
 */
export function userMatchesTargeting(
   user: {
      universityCountryCode?: string
      university?: { code?: string; name?: string }
      fieldOfStudy?: { id?: string; name?: string }
   },
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
): boolean {
   let matches = true

   // Check ALL targeting criteria - user must match all of them

   // Check countries
   if (targeting.countries.length > 0) {
      matches =
         matches &&
         !!user.universityCountryCode &&
         targeting.countries.includes(user.universityCountryCode)
   }

   // Check universities
   if (targeting.universities.length > 0) {
      matches =
         matches &&
         !!user.university?.code &&
         targeting.universities.includes(user.university.code)
   }

   // Check fields of study
   if (targeting.fieldsOfStudy.length > 0) {
      matches =
         matches &&
         !!user.fieldOfStudy?.id &&
         targeting.fieldsOfStudy.includes(user.fieldOfStudy.id)
   }

   return matches
}

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
 * Counts unique users who registered for the group's livestreams AND also match the targeting criteria
 * This filters registered users (not livestreams) based on the targeting criteria
 * Only counts users who have registered for the livestreams (registered.date is truthy)
 */
async function countRegisteredUsersMatchingTargeting(
   livestreamIds: string[],
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
): Promise<{ uniqueUsers: number; totalInteractions: number }> {
   if (livestreamIds.length === 0) {
      return { uniqueUsers: 0, totalInteractions: 0 }
   }

   // We can only have 30 "in" clauses
   const chunks = chunkArray(livestreamIds, 30)
   const allUserData: Array<{ userId: string; user: UserData }> = []

   for (const chunk of chunks) {
      const userDataQuery = await firestore
         .collectionGroup("userLivestreamData")
         .where("livestreamId", "in", chunk)
         .select("userId", "registered", "user")
         .get()

      // Filter for only registered users (registered.date is truthy)
      const registeredUserData = userDataQuery.docs
         .map(
            (doc) =>
               doc.data() as Pick<
                  UserLivestreamData,
                  "userId" | "registered" | "user"
               >
         )
         .filter((data) => data.registered?.date)
         .map((data) => ({ userId: data.userId, user: data.user }))

      allUserData.push(...registeredUserData)
   }

   // Filter users based on targeting criteria
   const targetedUsers = allUserData.filter((userData) => {
      return userMatchesTargeting(userData.user, targeting)
   })

   const uniqueUserIds = new Set(
      targetedUsers.map((userData) => userData.userId)
   )

   return {
      uniqueUsers: uniqueUserIds.size,
      totalInteractions: targetedUsers.length,
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
      const userData = doc.data() as Pick<
         UserData,
         "universityCountryCode" | "university" | "fieldOfStudy"
      >

      return userMatchesTargeting(userData, targeting)
   })

   return matchingUsers.length
}
