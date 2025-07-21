import functions = require("firebase-functions")
import {
   FETCH_TYPES,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import {
   GetGroupTalentEngagementFnArgs,
   GetGroupTalentEngagementFnResponse,
   GetTotalUsersMatchingTargetingResponse,
} from "@careerfairy/shared-lib/functions/types"
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
import { paginateQuery } from "./util/firestore-admin"

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
            universities: array(
               object({
                  id: string().required(),
                  name: string().required(),
                  country: string().required(),
               })
            ).default([]),
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

            const response: GetGroupTalentEngagementFnResponse = {
               count: uniqueUsers,
            }

            return response
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
   middlewares<GetGroupTalentEngagementFnArgs>(
      dataValidation({
         groupId: string().required(),
         targeting: object({
            countries: array(string()).default([]),
            universities: array(
               object({
                  id: string().required(),
                  name: string().required(),
                  country: string().required(),
               })
            ).default([]),
            fieldsOfStudy: array(string()).default([]),
         }).required(),
      }),
      userShouldBeGroupAdmin(),
      talentEngagementCache(createTotalUsersMatchingTargetingCacheKey),
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

            const response: GetTotalUsersMatchingTargetingResponse = {
               total: totalMatchingUsers,
            }

            return response
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
 * Checks if a user matches the given targeting criteria
 * Enhanced logic to support country-specific university targeting:
 * - For each country in the targeting, if no universities are specified for that country, any university in that country matches
 * - If universities are specified for a country, only users from those specific universities match
 * - If universities are specified but none for the user's country, the user doesn't match
 * - This allows targeting all universities in some countries while targeting specific universities in others
 */
export function userMatchesTargeting(
   user: {
      universityCountryCode?: string
      university?: { code?: string; name?: string }
      fieldOfStudy?: { id?: string; name?: string }
   },
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
): boolean {
   // Defensive check: if user is null/undefined, return false
   if (!user) {
      return false
   }

   // Check field of study first (applies globally)
   if (targeting.fieldsOfStudy.length > 0) {
      if (
         !user.fieldOfStudy?.id ||
         !targeting.fieldsOfStudy.includes(user.fieldOfStudy.id)
      ) {
         return false
      }
   }

   // If no countries specified, match any user (with field of study check above)
   if (targeting.countries.length === 0) {
      return true
   }

   // User must be from a targeted country
   if (
      !user.universityCountryCode ||
      !targeting.countries.includes(user.universityCountryCode)
   ) {
      return false
   }

   // If no universities specified at all, any university in the targeted countries matches
   if (targeting.universities.length === 0) {
      return true
   }

   // Check if there are any universities specified for the user's country
   const universitiesInUserCountry = targeting.universities.filter(
      (uni) => uni.country === user.universityCountryCode
   )

   // If no universities specified for this country, any university in the country matches
   if (universitiesInUserCountry.length === 0) {
      return true
   }

   // If universities are specified for this country, user must have a university and it must be in the list
   if (!user.university?.code) {
      return false
   }

   return universitiesInUserCountry.some(
      (uni) => uni.id === user.university?.code
   )
}

function createTargetingSignature(
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
): string {
   return [
      `countries:${targeting.countries.sort().join(",")}`,
      `universities:${targeting.universities
         .map((u) => `${u.id}:${u.country}`)
         .sort()
         .join(",")}`,
      `fields:${targeting.fieldsOfStudy.sort().join(",")}`,
   ].join("|")
}

function createTalentEngagementCacheKey(
   request: CallableRequest<GetGroupTalentEngagementFnArgs>
): string[] {
   const { groupId, targeting } = request.data

   return [
      "groupTalentEngagement",
      groupId,
      createTargetingSignature(targeting),
   ]
}

/**
 * Creates a cache key for getTotalUsersMatchingTargeting function
 */
function createTotalUsersMatchingTargetingCacheKey(request: {
   data: { targeting: GetGroupTalentEngagementFnArgs["targeting"] }
}): string[] {
   const { targeting } = request.data

   return ["totalUsersMatchingTargeting", createTargetingSignature(targeting)]
}

/**
 * Counts unique users who registered for the group's livestreams AND also match the targeting criteria
 * This filters registered users (not livestreams) based on the targeting criteria
 * Only counts users who have registered for the livestreams (registered.date is truthy)
 * OPTIMIZED for memory efficiency by processing chunks independently and selecting minimal fields
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

   // Use a Set to track unique users across all chunks
   const uniqueUserIds = new Set<string>()
   let totalInteractions = 0

   // Process each chunk independently to reduce memory usage
   for (const chunk of chunks) {
      // Only select the minimal fields needed for filtering
      // This dramatically reduces memory usage compared to selecting entire 'user' object
      const userDataQuery = await firestore
         .collectionGroup("userLivestreamData")
         .where("livestreamId", "in", chunk)
         .select(
            "userId",
            "registered",
            "user.universityCountryCode",
            "user.university",
            "user.fieldOfStudy"
         )
         .get()

      // Process documents in this chunk
      for (const doc of userDataQuery.docs) {
         const data = doc.data() as {
            userId: string
            registered?: { date?: any }
            user: {
               universityCountryCode?: string
               university?: { code?: string; name?: string }
               fieldOfStudy?: { id?: string; name?: string }
            }
         }

         // Skip if not registered
         if (!data.registered?.date) {
            continue
         }

         // Skip if user data is missing
         if (!data.user) {
            continue
         }

         // Check if user matches targeting criteria
         if (userMatchesTargeting(data.user, targeting)) {
            uniqueUserIds.add(data.userId)
            totalInteractions++
         }
      }

      // Log progress for large datasets
      functions.logger.info(
         `Processed chunk ${chunks.indexOf(chunk) + 1}/${chunks.length}, ` +
            `current unique users: ${uniqueUserIds.size}, interactions: ${totalInteractions}`
      )
   }

   return {
      uniqueUsers: uniqueUserIds.size,
      totalInteractions,
   }
}

/**
 * Counts total users in the database who match the given targeting criteria.
 * This queries the userData collection based on user's university country, field of study, and university.
 * Users must match ALL targeting criteria (AND logic), not just one.
 * OPTIMIZED for memory efficiency by processing users in batches with pagination
 */
async function countTotalUsersMatchingTargeting(
   targeting: GetGroupTalentEngagementFnArgs["targeting"]
): Promise<number> {
   // Check if we have any targeting criteria to apply
   const hasTargeting =
      targeting.countries.length > 0 ||
      targeting.universities.length > 0 ||
      targeting.fieldsOfStudy.length > 0

   if (!hasTargeting) {
      return 0
   }

   // Since Firestore doesn't support multiple "in" queries in a single query,
   // we'll use one criteria for the query and filter ALL others in memory
   let query: Query = firestore.collection("userData")

   // Choose the most selective targeting criteria for the Firestore query
   // Priority: universities > countries > fieldsOfStudy (most to least selective)
   if (targeting.countries.length > 0) {
      query = query.where("universityCountryCode", "in", targeting.countries)
   } else if (targeting.fieldsOfStudy.length > 0) {
      query = query.where("fieldOfStudy.id", "in", targeting.fieldsOfStudy)
   }

   // Only select the fields we need for filtering to reduce memory usage
   query = query.select("universityCountryCode", "university", "fieldOfStudy")

   // Use pagination utility to process users in batches
   return await paginateQuery(
      query,
      500, // batch size
      // Processor: filter and count matching users in each batch
      (docs) => {
         let batchCount = 0
         for (const doc of docs) {
            const userData = doc.data() as Pick<
               UserData,
               "universityCountryCode" | "university" | "fieldOfStudy"
            >

            // Skip if user data is missing
            if (!userData) {
               continue
            }

            if (userMatchesTargeting(userData, targeting)) {
               batchCount++
            }
         }
         return batchCount
      },
      // Accumulator: sum up counts from all batches
      (totalCount, batchCount, { batchNumber, batchSize }) => {
         const newTotal = totalCount + batchCount
         functions.logger.info(
            `Batch ${batchNumber}: ${batchCount}/${batchSize} users matched targeting, ` +
               `total so far: ${newTotal}`
         )
         return newTotal
      },
      0 // initial value
   )
}
