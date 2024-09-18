import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CompanyIndustryValues } from "@careerfairy/shared-lib/constants/forms"
import {
   CompetitorAudienceBigQueryResult,
   CompetitorAudienceData,
   CompetitorIndustryBigQueryResult,
   CompetitorIndustryData,
   CompetitorSparkData,
   LinearBarDataPoint,
   MostSomethingBase,
   MostSomethingBigQueryResult,
   PieChartDataPoint,
   SparksAnalyticsDTO,
   TimePeriodParams,
   TimeseriesDataPoint,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { BigQuery } from "@google-cloud/bigquery"
import { Firestore } from "firebase-admin/firestore"
import IBigQueryService from "../../bigQuery/IBigQueryService"
import { ISparkFunctionsRepository } from "../SparkFunctionsRepository"
import {
   top10Countries,
   top10FieldsOfStudy,
   top10Universities,
   topLevelsOfStudy,
} from "./queries/Audience"
import { topSparksByAudience, topSparksByIndustry } from "./queries/Competitor"
import {
   timeseriesLikesPastYear,
   timeseriesPageClicksPastYear,
   timeseriesRegistrationsPastYear,
   timeseriesSharesPastYear,
} from "./queries/Engagement"
import {
   mostLiked,
   mostRecent,
   mostShared,
   mostWatched,
} from "./queries/MostSomething"
import { totalViewsPastYear, uniqueViewersPastYear } from "./queries/Reach"

const AUDIENCE_SPARKS_LIMIT = 4
const INDUSTRY_SPARKS_LIMIT = 4

/**
 * Interface for the GroupSparksAnalyticsRepository
 * @interface
 */
interface IGroupSparksAnalyticsRepository {
   /**
    * Get group's total sparks views for the past year
    * @returns {Promise<TimeseriesDataPoint[]>} Promise object represents the total views for the past year
    */
   getTotalViewsPastYear(): Promise<TimeseriesDataPoint[]>

   /**
    * Get group sparks' unique viewers for the past year
    * @returns {Promise<TimeseriesDataPoint[]>} Promise object represents the unique viewers for the past year
    */
   getUniqueViewersPastYear(): Promise<TimeseriesDataPoint[]>

   /**
    * Get group's sparks likes for the past year
    * @returns {Promise<TimeseriesDataPoint[]>} Promise object represents the likes for the past year
    */
   getLikesPastYear(): Promise<TimeseriesDataPoint[]>

   /**
    * Get group's sparks shares for the past year
    * @returns {Promise<TimeseriesDataPoint[]>} Promise object represents the shares for the past year
    */
   getSharesPastYear(): Promise<TimeseriesDataPoint[]>

   /**
    * Get event registrations from sparks for the past year
    * @returns {Promise<TimeseriesDataPoint[]>} Promise object represents the registrations for the past year
    */
   getRegistrationsPastYear(): Promise<TimeseriesDataPoint[]>

   /**
    * Get group's sparks page clicks for the past year
    * @returns {Promise<TimeseriesDataPoint[]>} Promise object represents the page clicks for the past year
    */
   getPageClicksPastYear(): Promise<TimeseriesDataPoint[]>

   /**
    * Get group's most watched sparks for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the most watched sparks for the given time period
    */
   getMostWatchedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]>

   /**
    * Get group's most liked sparks for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the most liked sparks for the given time period
    */
   getMostLikedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]>

   /**
    * Get group's most shared sparks for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the most shared sparks for the given time period
    */
   getMostSharedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]>

   /**
    * Get group's most recent sparks
    * @returns {Promise<MostSomethingBase>} Promise object represents the most recent sparks
    */
   getMostRecentSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]>

   /**
    * Get group's sparks audience top countries for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<LinearBarDataPoint[]>} Promise object represents the top countries for the given time period
    */
   getTopCountries(timeperiod: TimePeriodParams): Promise<LinearBarDataPoint[]>

   /**
    * Get group's sparks audience top universities for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<LinearBarDataPoint[]>} Promise object represents the top universities for the given time period
    */
   getTopUniversities(
      timeperiod: TimePeriodParams
   ): Promise<LinearBarDataPoint[]>

   /**
    * Get group's sparks audience top fields of study for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<PieChartDataPoint[]>} Promise object represents the top fields of study for the given time period
    */
   getTopFieldsOfStudy(
      timeperiod: TimePeriodParams
   ): Promise<PieChartDataPoint[]>

   /**
    * Get group's sparks audience levels of study for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<PieChartDataPoint[]>} Promise object represents the levels of study for the given time period
    */
   getLevelsOfStudy(timeperiod: TimePeriodParams): Promise<PieChartDataPoint[]>

   /**
    * Get group's top sparks by industry for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the top sparks by industry for the given time period
    */
   getTopSparksByIndustry(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorIndustryData>

   /**
    * Get group's top sparks by audience for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the top sparks by audience for the given time period
    */
   getTopSparksByAudience(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorAudienceData<CompetitorSparkData[]>>

   /**
    * Retrieves the cached analytics data for the group.
    * @returns {Promise<SparksAnalyticsDTO | null>} A promise that resolves to the cached analytics data, or null if no cache exists.
    */
   getCachedAnalytics(): Promise<SparksAnalyticsDTO | null>

   /**
    * Updates the analytics cache with new data.
    * @param {SparksAnalyticsDTO} analytics - The new analytics data to cache.
    * @returns {Promise<void>} A promise that resolves when the cache has been updated.
    */
   updateAnalyticsCache(analytics: SparksAnalyticsDTO): Promise<void>
}

class GroupSparksAnalyticsRepository
   implements IGroupSparksAnalyticsRepository
{
   private readonly groupId: string
   private bigQueryService: IBigQueryService
   private firestore: Firestore
   private sparksRepo: ISparkFunctionsRepository
   private readonly timePeriodMap: Record<TimePeriodParams, string> = {
      "7days": "7 DAY",
      "30days": "30 DAY",
      "6months": "6 MONTH",
      "1year": "1 YEAR",
   }

   constructor(
      groupId: string,
      bigQueryClient: BigQuery,
      firestoreClient: Firestore,
      sparksRepo: ISparkFunctionsRepository
   ) {
      this.groupId = groupId
      this.bigQueryService = new IBigQueryService(bigQueryClient)
      this.firestore = firestoreClient
      this.sparksRepo = sparksRepo
   }

   async getCachedAnalytics(): Promise<SparksAnalyticsDTO> {
      const doc = await this.firestore
         .collection("sparksAnalytics")
         .withConverter(createGenericConverter<SparksAnalyticsDTO>())
         .doc(this.groupId)
         .get()

      return doc.data() as SparksAnalyticsDTO
   }

   async updateAnalyticsCache(analytics: SparksAnalyticsDTO): Promise<void> {
      await this.firestore
         .collection("sparksAnalytics")
         .doc(this.groupId)
         .set(analytics)
   }

   getTotalViewsPastYear(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(totalViewsPastYear)
   }

   getUniqueViewersPastYear(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         uniqueViewersPastYear
      )
   }

   getLikesPastYear(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesLikesPastYear
      )
   }

   getSharesPastYear(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesSharesPastYear
      )
   }

   getRegistrationsPastYear(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesRegistrationsPastYear
      )
   }

   getPageClicksPastYear(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesPageClicksPastYear
      )
   }

   private async getMostSomething(
      timeperiod: TimePeriodParams,
      getSqlQuery: (string) => string
   ): Promise<MostSomethingBase[]> {
      const bigQueryResults =
         await this.handleQueryPromiseWithTimePeriodValidation<
            MostSomethingBigQueryResult[]
         >(getSqlQuery, timeperiod)

      const sparkIds = bigQueryResults.map((result) => result.sparkId)

      const sparks = await this.sparksRepo.getSparksByIds(sparkIds)

      const result = bigQueryResults.map((bigQueryResult) => {
         const spark = sparks.find(
            (spark) => spark.id === bigQueryResult.sparkId
         )
         return {
            sparkData: {
               creator: {
                  avatarUrl: spark.creator.avatarUrl,
                  firstName: spark.creator.firstName,
                  lastName: spark.creator.lastName,
               },
               group: {
                  id: spark.group.id,
                  name: spark.group.universityName,
               },
               spark: {
                  question: spark.question,
                  categoryId: spark.category.id,
                  videoThumbnailUrl: spark.video.thumbnailUrl,
               },
            },
            num_views: bigQueryResult.num_views,
            num_likes: bigQueryResult.num_likes,
            num_shares: bigQueryResult.num_shares,
            num_clicks: bigQueryResult.num_clicks,
         } as MostSomethingBase
      })

      return result
   }

   getMostWatchedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]> {
      return this.getMostSomething(timeperiod, mostWatched)
   }

   getMostLikedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]> {
      return this.getMostSomething(timeperiod, mostLiked)
   }

   getMostSharedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]> {
      return this.getMostSomething(timeperiod, mostShared)
   }

   async getMostRecentSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase[]> {
      const bigQueryResults =
         await this.handleQueryPromiseWithTimePeriodValidation<
            MostSomethingBigQueryResult[]
         >(mostRecent, timeperiod)

      const sparkIds = bigQueryResults.map((result) => result.sparkId)

      const sparks = await this.sparksRepo.getSparksByIds(sparkIds)

      const result = bigQueryResults.map((bigQueryResult) => {
         const spark = sparks.find(
            (spark) => spark.id === bigQueryResult.sparkId
         )
         return {
            sparkData: {
               creator: {
                  avatarUrl: spark.creator.avatarUrl,
                  firstName: spark.creator.firstName,
                  lastName: spark.creator.lastName,
               },
               group: {
                  id: spark.group.id,
                  name: spark.group.universityName,
               },
               spark: {
                  question: spark.question,
                  categoryId: spark.category.id,
                  videoThumbnailUrl: spark.video.thumbnailUrl,
               },
            },
            num_views: bigQueryResult.num_views,
            num_likes: bigQueryResult.num_likes,
            num_shares: bigQueryResult.num_shares,
            num_clicks: bigQueryResult.num_clicks,
         } as MostSomethingBase
      })

      return result
   }

   getTopCountries(
      timeperiod: TimePeriodParams
   ): Promise<LinearBarDataPoint[]> {
      return this.handleQueryPromiseWithTimePeriodValidation<
         LinearBarDataPoint[]
      >(top10Countries, timeperiod)
   }

   getTopUniversities(
      timeperiod: TimePeriodParams
   ): Promise<LinearBarDataPoint[]> {
      return this.handleQueryPromiseWithTimePeriodValidation<
         LinearBarDataPoint[]
      >(top10Universities, timeperiod)
   }

   getTopFieldsOfStudy(
      timeperiod: TimePeriodParams
   ): Promise<PieChartDataPoint[]> {
      return this.handleQueryPromiseWithTimePeriodValidation<
         PieChartDataPoint[]
      >(top10FieldsOfStudy, timeperiod)
   }

   getLevelsOfStudy(
      timeperiod: TimePeriodParams
   ): Promise<PieChartDataPoint[]> {
      return this.handleQueryPromiseWithTimePeriodValidation<
         PieChartDataPoint[]
      >(topLevelsOfStudy, timeperiod)
   }

   private convertSparkToCompetitorStaticCardData(
      spark: Spark
   ): CompetitorSparkData["sparkData"] {
      return {
         creator: {
            avatarUrl: spark.creator.avatarUrl,
            firstName: spark.creator.firstName,
            lastName: spark.creator.lastName,
         },
         group: {
            id: spark.group.id,
            name: spark.group.universityName,
         },
         spark: {
            question: spark.question,
            categoryId: spark.category.id,
            videoThumbnailUrl: spark.video.thumbnailUrl,
         },
      }
   }

   async getTopSparksByIndustry(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorIndustryData> {
      const bigQueryResults =
         await this.handleQueryPromiseWithTimePeriodValidation<
            CompetitorIndustryBigQueryResult[]
         >(topSparksByIndustry, timeperiod)

      const sparkIdsToFetch = []

      const industrySegmentsSparksCount = CompanyIndustryValues.reduce(
         (acc, industry) => {
            acc[industry.id] = 0
            return acc
         },
         {} as Record<string, number>
      )

      for (const item of bigQueryResults) {
         if (
            industrySegmentsSparksCount[item.industry] < INDUSTRY_SPARKS_LIMIT
         ) {
            industrySegmentsSparksCount[item.industry] += 1
            sparkIdsToFetch.push(item.sparkId)
         }
      }

      const sparks = await this.sparksRepo.getSparksByIds(sparkIdsToFetch)

      const sparksLookup = sparks.reduce((acc, spark) => {
         acc[spark.id] = spark
         return acc
      }, {} as Record<string, Spark>)

      const industrySegmentsMap = CompanyIndustryValues.reduce(
         (acc, industry) => {
            acc[industry.id] = []
            return acc
         },
         {} as Record<string, CompetitorSparkData[]>
      )

      for (const item of bigQueryResults) {
         if (
            industrySegmentsMap[item.industry]?.length <
               INDUSTRY_SPARKS_LIMIT &&
            sparksLookup[item.sparkId]
         ) {
            industrySegmentsMap[item.industry].push({
               sparkData: this.convertSparkToCompetitorStaticCardData(
                  sparksLookup[item.sparkId]
               ),
               plays: item.plays,
               avg_watched_time: item.avg_watched_time,
               engagement: item.engagement,
            })
         }
      }

      const auxAllSet = new Set<CompetitorSparkData>()

      for (const item of bigQueryResults) {
         if (
            auxAllSet.size < INDUSTRY_SPARKS_LIMIT &&
            sparksLookup[item.sparkId]
         ) {
            auxAllSet.add({
               sparkData: this.convertSparkToCompetitorStaticCardData(
                  sparksLookup[item.sparkId]
               ),
               plays: item.plays,
               avg_watched_time: item.avg_watched_time,
               engagement: item.engagement,
            })
         }
      }

      industrySegmentsMap["all"] = Array.from(auxAllSet)

      const result = Object.entries(industrySegmentsMap).reduce(
         (acc, [key, value]) => {
            if (value.length > 0) {
               acc[key] = value
            }
            return acc
         },
         {}
      )

      return result
   }

   async getTopSparksByAudience(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorAudienceData<CompetitorSparkData[]>> {
      const bigQueryResults =
         await this.handleQueryPromiseWithTimePeriodValidation<
            CompetitorAudienceBigQueryResult[]
         >(topSparksByAudience, timeperiod)

      const sparkIdsToFetch = []

      const audienceSegmentsSparksCount = bigQueryResults.reduce(
         (acc, item) => {
            acc[item.audience] = 0
            return acc
         },
         {} as Record<string, number>
      )

      for (const item of bigQueryResults) {
         if (
            audienceSegmentsSparksCount[item.audience] < AUDIENCE_SPARKS_LIMIT
         ) {
            audienceSegmentsSparksCount[item.audience] += 1
            sparkIdsToFetch.push(item.sparkId)
         }
      }

      const sparks = await this.sparksRepo.getSparksByIds(sparkIdsToFetch)

      const sparksLookup = sparks.reduce((acc, spark) => {
         acc[spark.id] = spark
         return acc
      }, {} as Record<string, Spark>)

      const audienceSegmentsMap = bigQueryResults.reduce((acc, item) => {
         acc[item.audience] = []
         return acc
      }, {} as Record<string, CompetitorSparkData[]>)

      for (const item of bigQueryResults) {
         if (
            audienceSegmentsMap[item.audience]?.length <
               AUDIENCE_SPARKS_LIMIT &&
            sparksLookup[item.sparkId]
         ) {
            audienceSegmentsMap[item.audience].push({
               sparkData: this.convertSparkToCompetitorStaticCardData(
                  sparksLookup[item.sparkId]
               ),
               plays: item.plays,
               avg_watched_time: item.avg_watched_time,
               engagement: item.engagement,
            })
         }
      }

      const auxAllSet = new Set<CompetitorSparkData>()

      for (const item of bigQueryResults) {
         if (
            auxAllSet.size < INDUSTRY_SPARKS_LIMIT &&
            sparksLookup[item.sparkId]
         ) {
            auxAllSet.add({
               sparkData: this.convertSparkToCompetitorStaticCardData(
                  sparksLookup[item.sparkId]
               ),
               plays: item.plays,
               avg_watched_time: item.avg_watched_time,
               engagement: item.engagement,
            })
         }
      }

      audienceSegmentsMap["all"] = Array.from(auxAllSet)

      const result = Object.entries(audienceSegmentsMap).reduce(
         (acc, [key, value]) => {
            if (value.length > 0) {
               acc[key] = value
            }
            return acc
         },
         {} as CompetitorAudienceData<CompetitorSparkData[]>
      )

      return result
   }

   private async handleQueryPromise<T>(
      sqlQuery: string,
      params?: object
   ): Promise<T> {
      const paramsQuery = { groupId: this.groupId, ...params }
      const [rows] = await this.bigQueryService.query(sqlQuery, paramsQuery)
      return rows as T
   }

   private async handleQueryPromiseWithTimePeriodValidation<T>(
      getSqlQuery: (string) => string,
      timeperiod: TimePeriodParams
   ): Promise<T> {
      const sqlQueryWithTimePeriod = getSqlQuery(this.timePeriodMap[timeperiod])
      return this.handleQueryPromise<T>(sqlQueryWithTimePeriod)
   }
}

export default GroupSparksAnalyticsRepository
