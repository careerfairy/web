import {
   LinearBarDataPoint,
   MostSomethingBase,
   PieChartDataPoint,
   TimePeriodParams,
   TimeseriesDataPoint,
} from "./GroupSparksAnalyticsTypes"
import IBigQueryService from "../../bigQuery/IBigQueryService"
import { BigQuery } from "@google-cloud/bigquery"
import { totalViewsPastYear, uniqueViewersPastYear } from "./queries/Reach"
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
import {
   top10Countries,
   top10FieldsOfStudy,
   top10Universities,
   topLevelsOfStudy,
} from "./queries/Audience"

/**
 * Interface for the SparksAnalyticsRepository
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
   ): Promise<MostSomethingBase>

   /**
    * Get group's most liked sparks for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the most liked sparks for the given time period
    */
   getMostLikedSparks(timeperiod: TimePeriodParams): Promise<MostSomethingBase>

   /**
    * Get group's most shared sparks for a given time period
    * @param {TimePeriodParams} timeperiod - The time period to consider
    * @returns {Promise<MostSomethingBase>} Promise object represents the most shared sparks for the given time period
    */
   getMostSharedSparks(timeperiod: TimePeriodParams): Promise<MostSomethingBase>

   /**
    * Get group's most recent sparks
    * @returns {Promise<MostSomethingBase>} Promise object represents the most recent sparks
    */
   getMostRecentSparks(): Promise<MostSomethingBase>

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
}

class GroupSparksAnalyticsRepository
   implements IGroupSparksAnalyticsRepository
{
   private readonly groupId: string
   private bigQueryService: IBigQueryService
   private readonly timePeriodMap: Record<TimePeriodParams, string> = {
      "7days": "7 DAY",
      "30days": "30 DAY",
      "6months": "6 MONTH",
      "1year": "1 YEAR",
   }

   constructor(groupId: string, bigQueryClient: BigQuery) {
      this.groupId = groupId
      this.bigQueryService = new IBigQueryService(bigQueryClient)
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

   getMostWatchedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase> {
      return this.handleQueryPromiseWithTimePeriodValidation<MostSomethingBase>(
         mostWatched,
         timeperiod
      )
   }

   getMostLikedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase> {
      return this.handleQueryPromiseWithTimePeriodValidation<MostSomethingBase>(
         mostLiked,
         timeperiod
      )
   }

   getMostSharedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase> {
      return this.handleQueryPromiseWithTimePeriodValidation<MostSomethingBase>(
         mostShared,
         timeperiod
      )
   }

   getMostRecentSparks(): Promise<MostSomethingBase> {
      return this.handleQueryPromise<MostSomethingBase>(mostRecent)
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
