import { Group } from "@careerfairy/shared-lib/groups"
import {
   SparksAnalyticsDTO,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Timestamp } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { onCall } from "firebase-functions/https"
import { string } from "yup"
import { getSparksAnalyticsRepoInstance, sparkRepo } from "./api/repositories"
import GroupSparksAnalyticsRepository from "./lib/sparks/analytics/GroupSparksAnalyticsRepository"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"

const fetchTimePeriodData = (
   repoPromise: (timeperiod: TimePeriodParams) => Promise<any>
) => {
   return Promise.all([
      repoPromise("7days"),
      repoPromise("30days"),
      repoPromise("6months"),
      repoPromise("1year"),
   ])
}

async function fetchAnalyticsFromBigQuery(
   sparksAnalyticsRepo: GroupSparksAnalyticsRepository
) {
   const [
      totalViews,
      uniqueViewers,
      likes,
      shares,
      registrations,
      pageClicks,
      [
         mostWatched7days,
         mostWatched30days,
         mostWatched6months,
         mostWatched1year,
      ],
      [mostLiked7days, mostLiked30days, mostLiked6months, mostLiked1year],
      [mostShared7days, mostShared30days, mostShared6months, mostShared1year],
      [mostRecent7days, mostRecent30days, mostRecent6months, mostRecent1year],
      [
         topCountries7days,
         topCountries30days,
         topCountries6months,
         topCountries1year,
      ],
      [
         topUniversities7days,
         topUniversities30days,
         topUniversities6months,
         topUniversities1year,
      ],
      [
         topFieldsOfStudy7days,
         topFieldsOfStudy30days,
         topFieldsOfStudy6months,
         topFieldsOfStudy1year,
      ],
      [
         levelsOfStudy7days,
         levelsOfStudy30days,
         levelsOfStudy6months,
         levelsOfStudy1year,
      ],
      [
         topCompaniesByIndustry7days,
         topCompaniesByIndustry30days,
         topCompaniesByIndustry6months,
         topCompaniesByIndustry1year,
      ],
      [
         topSparksByIndustry7days,
         topSparksByIndustry30days,
         topSparksByIndustry6months,
         topSparksByIndustry1year,
      ],
      [
         topSparksByAudience7days,
         topSparksByAudience30days,
         topSparksByAudience6months,
         topSparksByAudience1year,
      ],
   ] = await Promise.all([
      sparksAnalyticsRepo.getTotalViewsPastYear(),
      sparksAnalyticsRepo.getUniqueViewersPastYear(),
      sparksAnalyticsRepo.getLikesPastYear(),
      sparksAnalyticsRepo.getSharesPastYear(),
      sparksAnalyticsRepo.getRegistrationsPastYear(),
      sparksAnalyticsRepo.getPageClicksPastYear(),
      fetchTimePeriodData(
         // Binding is necessary here to ensure that the method gets called with the correct context (i.e., sparksAnalyticsRepo)
         sparksAnalyticsRepo.getMostWatchedSparks.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getMostLikedSparks.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getMostSharedSparks.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getMostRecentSparks.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getTopCountries.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getTopUniversities.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getTopFieldsOfStudy.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getLevelsOfStudy.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getTopCompaniesByIndustry.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getTopSparksByIndustry.bind(sparksAnalyticsRepo)
      ),
      fetchTimePeriodData(
         sparksAnalyticsRepo.getTopSparksByAudience.bind(sparksAnalyticsRepo)
      ),
   ])

   const SparksAnalyticsPayload: Omit<SparksAnalyticsDTO, "id"> = {
      reach: {
         totalViews: totalViews,
         uniqueViewers: uniqueViewers,
      },
      engagement: {
         likes: likes,
         shares: shares,
         registrations: registrations,
         pageClicks: pageClicks,
      },
      most: {
         watched: {
            "7days": mostWatched7days,
            "30days": mostWatched30days,
            "6months": mostWatched6months,
            "1year": mostWatched1year,
         },
         liked: {
            "7days": mostLiked7days,
            "30days": mostLiked30days,
            "6months": mostLiked6months,
            "1year": mostLiked1year,
         },
         shared: {
            "7days": mostShared7days,
            "30days": mostShared30days,
            "6months": mostShared6months,
            "1year": mostShared1year,
         },
         recent: {
            "7days": mostRecent7days,
            "30days": mostRecent30days,
            "6months": mostRecent6months,
            "1year": mostRecent1year,
         },
      },
      topCountries: {
         "7days": topCountries7days,
         "30days": topCountries30days,
         "6months": topCountries6months,
         "1year": topCountries1year,
      },
      topUniversities: {
         "7days": topUniversities7days,
         "30days": topUniversities30days,
         "6months": topUniversities6months,
         "1year": topUniversities1year,
      },
      topFieldsOfStudy: {
         "7days": topFieldsOfStudy7days,
         "30days": topFieldsOfStudy30days,
         "6months": topFieldsOfStudy6months,
         "1year": topFieldsOfStudy1year,
      },
      levelsOfStudy: {
         "7days": levelsOfStudy7days,
         "30days": levelsOfStudy30days,
         "6months": levelsOfStudy6months,
         "1year": levelsOfStudy1year,
      },
      topCompaniesByIndustry: {
         "7days": topCompaniesByIndustry7days,
         "30days": topCompaniesByIndustry30days,
         "6months": topCompaniesByIndustry6months,
         "1year": topCompaniesByIndustry1year,
      },
      topSparksByIndustry: {
         "7days": topSparksByIndustry7days,
         "30days": topSparksByIndustry30days,
         "6months": topSparksByIndustry6months,
         "1year": topSparksByIndustry1year,
      },
      topSparksByAudience: {
         "7days": topSparksByAudience7days,
         "30days": topSparksByAudience30days,
         "6months": topSparksByAudience6months,
         "1year": topSparksByAudience1year,
      },
      updatedAt: Timestamp.now(),
   }

   functions.logger.info("Fetching successful.")

   return SparksAnalyticsPayload
}

export const getSparkStats = onCall(
   middlewares<{ groupId: string; sparkId: string; group?: Group }>(
      dataValidation({
         groupId: string().required(),
         sparkId: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (request) => {
         try {
            const { groupId, sparkId } = request.data
            const sparksAnalyticsRepo = getSparksAnalyticsRepoInstance(
               groupId,
               sparkRepo
            )

            functions.logger.info(
               `Fetching spark stats of ${sparkId} from group ${groupId}...`
            )

            const sparkStatsData = await sparksAnalyticsRepo.getSparkStats(
               sparkId
            )

            return sparkStatsData
         } catch (error) {
            functions.logger.error("Error fetching sparks stats", {
               request,
               error,
            })
            logAndThrow("Error fetching sparks stats", {
               request,
               error,
            })
         }
      }
   )
)

export const getSparksAnalytics = onCall(
   {
      timeoutSeconds: 60,
      memory: "512MiB",
   },
   middlewares<{ groupId: string; group?: Group }>(
      dataValidation({
         groupId: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (request) => {
         try {
            const { groupId } = request.data
            const sparksAnalyticsRepo = getSparksAnalyticsRepoInstance(
               groupId,
               sparkRepo
            )

            functions.logger.info(
               `Fetching sparks analytics for group ${groupId}...`
            )

            const bigQueryAnalyticsData = await fetchAnalyticsFromBigQuery(
               sparksAnalyticsRepo
            )

            await sparksAnalyticsRepo.updateAnalyticsInFirestore({
               ...bigQueryAnalyticsData,
               id: groupId,
            })

            functions.logger.info(
               "Sparks analytics cache updated in Firestore."
            )

            return bigQueryAnalyticsData
         } catch (error) {
            functions.logger.error("Error fetching sparks analytics", {
               request,
               error,
            })
            logAndThrow("Error fetching sparks analytics", {
               request,
               error,
            })
         }
      }
   )
)
