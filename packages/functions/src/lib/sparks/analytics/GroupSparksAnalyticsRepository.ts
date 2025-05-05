import {
   CompetitorAudienceBigQueryResult,
   CompetitorAudienceData,
   CompetitorCompanyBigQueryResult,
   CompetitorCompanyIndustryData,
   CompetitorIndustryBigQueryResult,
   CompetitorIndustryData,
   CompetitorIndustryDataBase,
   CompetitorTopCompaniesData,
   LinearBarDataPoint,
   MostSomethingBase,
   MostSomethingBigQueryResult,
   PieChartDataPoint,
   SparksAnalyticsDTO,
   SparkStatsFromBigQuery,
   TimePeriodParams,
   TimeseriesDataPoint,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { BigQuery } from "@google-cloud/bigquery"
import { Firestore } from "firebase-admin/firestore"
import { createAdminConverter } from "../../../util/firestore-admin"
import IBigQueryService from "../../bigQuery/IBigQueryService"
import { ISparkFunctionsRepository } from "../SparkFunctionsRepository"
import {
   top10Countries,
   top10FieldsOfStudy,
   top10Universities,
   topLevelsOfStudy,
} from "./queries/Audience"
import {
   topCompaniesByIndustry,
   topSparksByAudience,
   topSparksByIndustry,
} from "./queries/Competitor"
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
import { sparkStats } from "./queries/SparkStats"
import {
   convertSparkToCompetitorSparkCardData,
   MIN_NUM_COMPANIES,
   NUM_SPARKS_LIMIT,
} from "./utils"

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
    * Get top companies by industry for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<CompetitorIndustryData>} Promise object represents the top companies by industry for the given time period
    */
   getTopCompaniesByIndustry(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorCompanyIndustryData>

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
   ): Promise<CompetitorAudienceData>

   /**
    * Retrieves the cached analytics data for the group.
    * @returns {Promise<SparksAnalyticsDTO | null>} A promise that resolves to the cached analytics data, or null if no cache exists.
    */
   getAnalyticsFromFirestore(): Promise<SparksAnalyticsDTO | null>

   /**
    * Updates the analytics cache with new data.
    * @param {SparksAnalyticsDTO} analytics - The new analytics data to cache.
    * @returns {Promise<void>} A promise that resolves when the cache has been updated.
    */
   updateAnalyticsInFirestore(analytics: SparksAnalyticsDTO): Promise<void>

   /**
    * Retrieves statistics for a specific spark from BigQuery.
    * @param {string} sparkId - The unique identifier of the spark.
    * @returns {Promise<SparkStatsFromBigQuery>} A promise that resolves to the statistics for the specified spark.
    */
   getSparkStats(sparkId: string): Promise<SparkStatsFromBigQuery>
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

   async getAnalyticsFromFirestore(): Promise<SparksAnalyticsDTO> {
      const doc = await this.firestore
         .collection("sparksAnalytics")
         .withConverter(createAdminConverter<SparksAnalyticsDTO>())
         .doc(this.groupId)
         .get()

      return doc.data()
   }

   async updateAnalyticsInFirestore(
      analytics: SparksAnalyticsDTO
   ): Promise<void> {
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

      const result = bigQueryResults
         .map<MostSomethingBase>((bigQueryResult) => {
            const spark = sparks.find(
               (spark) => spark.id === bigQueryResult.sparkId
            )

            if (!spark) {
               return null
            }

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
            }
         })
         .filter(Boolean)

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

      const result = bigQueryResults
         .map<MostSomethingBase>((bigQueryResult) => {
            const spark = sparks.find(
               (spark) => spark.id === bigQueryResult.sparkId
            )

            if (!spark) {
               return null
            }

            return {
               sparkData: {
                  creator: {
                     avatarUrl: spark.creator.avatarUrl,
                     firstName: spark.creator.firstName,
                     lastName: spark.creator.lastName,
                  },
                  group: {
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
            }
         })
         .filter(Boolean)

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

   async getTopCompaniesByIndustry(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorCompanyIndustryData> {
      const companyRankingBigQueryPromise =
         this.handleQueryPromiseWithTimePeriodValidation<
            CompetitorCompanyBigQueryResult[]
         >(topCompaniesByIndustry, timeperiod)

      const sparksByIndustryRankingBigQueryPromise =
         this.handleQueryPromiseWithTimePeriodValidation<
            CompetitorIndustryBigQueryResult[]
         >(topSparksByIndustry, timeperiod)

      const [
         companyRankingBigQueryResults,
         sparksByIndustryRankingBigQueryResults,
      ] = await Promise.all([
         companyRankingBigQueryPromise,
         sparksByIndustryRankingBigQueryPromise,
      ])

      const sparkIdsToFetch = new Set<string>()

      for (const item of sparksByIndustryRankingBigQueryResults) {
         sparkIdsToFetch.add(item.sparkId)
      }

      const sparks = await this.sparksRepo.getSparksByIds(
         Array.from(sparkIdsToFetch)
      )

      const sparksLookup: Record<string, Spark> = {}

      for (const spark of sparks) {
         if (!sparksLookup[spark.id]) {
            sparksLookup[spark.id] = spark
         }
      }

      const industryCompanyIndex: CompetitorTopCompaniesData = {}

      for (const item of companyRankingBigQueryResults) {
         if (!industryCompanyIndex[item.industry]) {
            industryCompanyIndex[item.industry] = {}
         }

         industryCompanyIndex[item.industry][item.groupId] = {
            sparks: [],
            rank: item.rank,
            groupLogo: null,
            groupName: null,
            totalViews: item.num_views,
            unique_viewers: item.unique_viewers,
            avg_watched_time: item.avg_watched_time,
            avg_watched_percentage: item.avg_watched_percentage,
            engagement: item.engagement,
         }
      }

      for (const item of sparksByIndustryRankingBigQueryResults) {
         const sparkData = sparksLookup[item.sparkId]

         if (
            !sparkData ||
            !industryCompanyIndex[item.industry] ||
            !industryCompanyIndex[item.industry][sparkData.group.id]
         ) {
            continue
         }

         if (
            industryCompanyIndex[item.industry][sparkData.group.id].sparks
               .length < NUM_SPARKS_LIMIT
         ) {
            industryCompanyIndex[item.industry][sparkData.group.id].sparks.push(
               {
                  sparkData: convertSparkToCompetitorSparkCardData(sparkData),
                  rank: item.rank,
                  num_views: item.num_views,
                  avg_watched_time: item.avg_watched_time,
                  avg_watched_percentage: item.avg_watched_percentage,
                  engagement: item.engagement,
               }
            )
         }
         industryCompanyIndex[item.industry][sparkData.group.id].groupLogo =
            sparkData.group.logoUrl
         industryCompanyIndex[item.industry][sparkData.group.id].groupName =
            sparkData.group.universityName
      }

      const result: CompetitorCompanyIndustryData = {}

      for (const industry of Object.keys(industryCompanyIndex)) {
         const groupRankInIndustry =
            industryCompanyIndex[industry]?.[this.groupId]?.rank

         const top5Companies = Object.values(
            industryCompanyIndex[industry]
         ).slice(0, 5)
         const groupData =
            groupRankInIndustry > 5
               ? industryCompanyIndex[industry]?.[this.groupId]
               : null

         const values = [...top5Companies, groupData].filter(Boolean)

         if (values.length >= MIN_NUM_COMPANIES) {
            result[industry] = values
         }
      }

      return result
   }

   async getTopSparksByIndustry(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorIndustryData> {
      const bigQueryResults =
         await this.handleQueryPromiseWithTimePeriodValidation<
            CompetitorIndustryBigQueryResult[]
         >(topSparksByIndustry, timeperiod)

      const sparkIdsToFetch = []

      const industrySegmentsSparksCount: Record<string, number> = {}

      for (const item of bigQueryResults) {
         if (!industrySegmentsSparksCount[item.industry]) {
            industrySegmentsSparksCount[item.industry] = 0
         }

         if (industrySegmentsSparksCount[item.industry] < NUM_SPARKS_LIMIT) {
            industrySegmentsSparksCount[item.industry] += 1
            sparkIdsToFetch.push(item.sparkId)
         }
      }

      const sparks = await this.sparksRepo.getSparksByIds(sparkIdsToFetch)

      const sparksLookup: Record<string, Spark> = {}

      for (const spark of sparks) {
         if (!sparksLookup[spark.id]) {
            sparksLookup[spark.id] = spark
         }
      }

      const result: Record<string, CompetitorIndustryDataBase[]> = {}

      for (const item of bigQueryResults) {
         if (!result[item.industry]) {
            result[item.industry] = []
         }

         if (
            result[item.industry]?.length < NUM_SPARKS_LIMIT &&
            sparksLookup[item.sparkId]
         ) {
            const sparkData = convertSparkToCompetitorSparkCardData(
               sparksLookup[item.sparkId]
            )
            sparkData.creator.avatarUrl =
               sparksLookup[item.sparkId].group.logoUrl

            result[item.industry].push({
               groupData: {
                  id: sparksLookup[item.sparkId].group.id,
                  name: sparksLookup[item.sparkId].group.universityName,
                  logoUrl: sparksLookup[item.sparkId].group.logoUrl,
               },
               sparkData: sparkData,
               rank: item.rank,
               num_views: item.num_views,
               avg_watched_time: item.avg_watched_time,
               avg_watched_percentage: item.avg_watched_percentage,
               engagement: item.engagement,
            })
         }
      }

      return result
   }

   async getTopSparksByAudience(
      timeperiod: TimePeriodParams
   ): Promise<CompetitorAudienceData> {
      const bigQueryResults =
         await this.handleQueryPromiseWithTimePeriodValidation<
            CompetitorAudienceBigQueryResult[]
         >(topSparksByAudience, timeperiod)

      const sparkIdsToFetch = []

      const audienceSegmentsSparksCount: Record<string, number> = {}

      for (const item of bigQueryResults) {
         if (!audienceSegmentsSparksCount[item.audience]) {
            audienceSegmentsSparksCount[item.audience] = 0
         }

         if (audienceSegmentsSparksCount[item.audience] < NUM_SPARKS_LIMIT) {
            audienceSegmentsSparksCount[item.audience] += 1
            sparkIdsToFetch.push(item.sparkId)
         }
      }

      const sparks = await this.sparksRepo.getSparksByIds(sparkIdsToFetch)

      const sparksLookup: Record<string, Spark> = {}

      for (const spark of sparks) {
         if (!sparksLookup[spark.id]) {
            sparksLookup[spark.id] = spark
         }
      }

      const result: CompetitorAudienceData = {
         "business-plus": [],
         engineering: [],
         "it-and-mathematics": [],
         "natural-sciences": [],
         "social-sciences": [],
         other: [],
      }

      for (const item of bigQueryResults) {
         if (!result[item.audience]) {
            result[item.audience] = []
         }

         if (
            result[item.audience]?.length < NUM_SPARKS_LIMIT &&
            sparksLookup[item.sparkId]
         ) {
            const sparkData = convertSparkToCompetitorSparkCardData(
               sparksLookup[item.sparkId]
            )
            sparkData.creator.avatarUrl =
               sparksLookup[item.sparkId].group.logoUrl

            delete sparkData.spark.id // to save some memory on firestore

            result[item.audience].push({
               sparkData: sparkData,
               rank: item.rank,
               num_views: item.num_views,
               avg_watched_time: item.avg_watched_time,
               avg_watched_percentage: item.avg_watched_percentage,
               engagement: item.engagement,
            })
         }
      }

      return result
   }

   async getSparkStats(sparkId: string): Promise<SparkStatsFromBigQuery> {
      const params = { sparkId }
      const rows = await this.handleQueryPromise<SparkStatsFromBigQuery>(
         sparkStats,
         params
      )
      return rows[0]
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
