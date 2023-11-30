import * as functions from "firebase-functions"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { string } from "yup"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "./middlewares/cacheMiddleware"
import { getSparksAnalyticsRepoInstance } from "./api/repositories"
import {
   LinearBarWithPastData,
   MostSomethingBase,
   MostSomethingWithPastData,
   PieChartWithPastData,
   TimePeriodParams,
   TimeseriesDataPoint,
} from "./lib/sparks/analytics/SparksAnalyticsTypes"

type ReachData = {
   totalViews: TimeseriesDataPoint[]
   uniqueViewers: TimeseriesDataPoint[]
}

type EngagementData = {
   likes: TimeseriesDataPoint[]
   shares: TimeseriesDataPoint[]
   registrations: TimeseriesDataPoint[]
   pageClicks: TimeseriesDataPoint[]
}

type MostWatchedData = {
   watched: MostSomethingWithPastData
   liked: MostSomethingWithPastData
   shared: MostSomethingWithPastData
   recent: MostSomethingBase
}

type SparksAnalyticsPayload = {
   reach: ReachData
   engagement: EngagementData
   most: MostWatchedData
   topCountries: LinearBarWithPastData
   topUniversities: LinearBarWithPastData
   topFieldsOfStudy: PieChartWithPastData
   levelsOfStudy: PieChartWithPastData
}

// Define cache settings
const cache = (cacheKeyFn: CacheKeyOnCallFn) =>
   cacheOnCallValues("sparks-analytics", cacheKeyFn, 600) // 5min

const sparksAnalyticsCacheKey = (args: { groupId: string }) => {
   return ["getSparksAnalytics", args.groupId]
}

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

export const getSparksAnalytics = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         groupId: string().required(),
      }),
      userShouldBeGroupAdmin(),
      cache((data) => sparksAnalyticsCacheKey({ ...data })),
      async (data, context) => {
         const groupId = data.groupId
         const sparksAnalyticsRepo = getSparksAnalyticsRepoInstance(groupId)

         functions.logger.info(
            `Fetching sparks analytics for group ${groupId}...`
         )

         try {
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
               [
                  mostLiked7days,
                  mostLiked30days,
                  mostLiked6months,
                  mostLiked1year,
               ],
               [
                  mostShared7days,
                  mostShared30days,
                  mostShared6months,
                  mostShared1year,
               ],
               mostRecent,
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
            ] = await Promise.all([
               sparksAnalyticsRepo.getTotalViewsPastYear(),
               sparksAnalyticsRepo.getUniqueViewersPastYear(),
               sparksAnalyticsRepo.getLikesPastYear(),
               sparksAnalyticsRepo.getSharesPastYear(),
               sparksAnalyticsRepo.getRegistrationsPastYear(),
               sparksAnalyticsRepo.getPageClicksPastYear(),
               fetchTimePeriodData(
                  // Binding is necessary here to ensure that the method gets called with the correct context (i.e., sparksAnalyticsRepo)
                  sparksAnalyticsRepo.getMostWatchedSparks.bind(
                     sparksAnalyticsRepo
                  )
               ),
               fetchTimePeriodData(
                  sparksAnalyticsRepo.getMostLikedSparks.bind(
                     sparksAnalyticsRepo
                  )
               ),
               fetchTimePeriodData(
                  sparksAnalyticsRepo.getMostSharedSparks.bind(
                     sparksAnalyticsRepo
                  )
               ),
               sparksAnalyticsRepo.getMostRecentSparks(),
               fetchTimePeriodData(
                  sparksAnalyticsRepo.getTopCountries.bind(sparksAnalyticsRepo)
               ),
               fetchTimePeriodData(
                  sparksAnalyticsRepo.getTopUniversities.bind(
                     sparksAnalyticsRepo
                  )
               ),
               fetchTimePeriodData(
                  sparksAnalyticsRepo.getTopFieldsOfStudy.bind(
                     sparksAnalyticsRepo
                  )
               ),
               fetchTimePeriodData(
                  sparksAnalyticsRepo.getLevelsOfStudy.bind(sparksAnalyticsRepo)
               ),
            ])

            const SparksAnalyticsPayload: SparksAnalyticsPayload = {
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
                  recent: mostRecent,
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
            }

            functions.logger.info("Fetching successful.")

            return SparksAnalyticsPayload
         } catch (error) {
            logAndThrow("Error in generating sparks analytics", {
               data,
               error,
               context,
            })
         }
      }
   )
)
