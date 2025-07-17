import functions = require("firebase-functions")
import {
   FETCH_TYPES,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import { GetGroupTalentEngagementFnArgs } from "@careerfairy/shared-lib/functions/types"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { chunkArray } from "@careerfairy/shared-lib/utils"
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
 * @returns { count: number } - The count of unique users
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
            logTalentEngagementResults({
               groupId,
               totalLivestreams,
               targetedLivestreams,
               uniqueUsers,
               totalInteractions,
               targeting: {
                  countries: targeting.countries.length,
                  universities: targeting.universities.length,
                  fieldsOfStudy: targeting.fieldsOfStudy.length,
               },
            })

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
 * Logs the talent engagement results with detailed metrics
 */
function logTalentEngagementResults(metrics: {
   groupId: string
   totalLivestreams: number
   targetedLivestreams: number
   uniqueUsers: number
   totalInteractions: number
   targeting: {
      countries: number
      universities: number
      fieldsOfStudy: number
   }
}): void {
   if (metrics.targetedLivestreams === 0) {
      functions.logger.info(
         `No targeted livestreams found for group ${metrics.groupId}`,
         {
            groupId: metrics.groupId,
            totalLivestreams: metrics.totalLivestreams,
            targetedLivestreams: 0,
         }
      )
   } else {
      functions.logger.info(
         `Group ${metrics.groupId} talent engagement count: ${metrics.uniqueUsers}`,
         {
            groupId: metrics.groupId,
            totalLivestreams: metrics.totalLivestreams,
            targetedLivestreams: metrics.targetedLivestreams,
            livestreamCount: metrics.targetedLivestreams,
            totalInteractions: metrics.totalInteractions,
            uniqueUsers: metrics.uniqueUsers,
            targeting: metrics.targeting,
         }
      )
   }
}
