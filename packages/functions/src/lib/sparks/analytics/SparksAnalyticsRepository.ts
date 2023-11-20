import {
   LinearBarDataPoint,
   MostSomethingBase,
   PieChartDataPoint,
   TimePeriodParams,
   TimeseriesDataPoint,
} from "./SparksAnalytics"
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

interface ISparksAnalyticsRepository {
   getTotalViews(): Promise<TimeseriesDataPoint[]>
   getUniqueViewers(): Promise<TimeseriesDataPoint[]>
   getLikes(): Promise<TimeseriesDataPoint[]>
   getShares(): Promise<TimeseriesDataPoint[]>
   getRegistrations(): Promise<TimeseriesDataPoint[]>
   getPageClicks(): Promise<TimeseriesDataPoint[]>
   getMostWatchedSparks(
      timeperiod: TimePeriodParams
   ): Promise<MostSomethingBase>
   getMostLikedSparks(timeperiod: TimePeriodParams): Promise<MostSomethingBase>
   getMostSharedSparks(timeperiod: TimePeriodParams): Promise<MostSomethingBase>
   getMostRecentSparks(): Promise<MostSomethingBase>
   getTopCountries(timeperiod: TimePeriodParams): Promise<LinearBarDataPoint[]>
   getTopUniversities(
      timeperiod: TimePeriodParams
   ): Promise<LinearBarDataPoint[]>
   getTopFieldsOfStudy(
      timeperiod: TimePeriodParams
   ): Promise<PieChartDataPoint[]>
   getLevelsOfStudy(timeperiod: TimePeriodParams): Promise<PieChartDataPoint[]>
}

class SparksAnalyticsRepository implements ISparksAnalyticsRepository {
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

   getTotalViews(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(totalViewsPastYear)
   }

   getUniqueViewers(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         uniqueViewersPastYear
      )
   }

   getLikes(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesLikesPastYear
      )
   }

   getShares(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesSharesPastYear
      )
   }

   getRegistrations(): Promise<TimeseriesDataPoint[]> {
      return this.handleQueryPromise<TimeseriesDataPoint[]>(
         timeseriesRegistrationsPastYear
      )
   }

   getPageClicks(): Promise<TimeseriesDataPoint[]> {
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
      sqlQuery: string,
      timeperiod: TimePeriodParams
   ): Promise<T> {
      const params = { timeperiod: this.timePeriodMap[timeperiod] }
      return this.handleQueryPromise<T>(sqlQuery, params)
   }
}

export default SparksAnalyticsRepository
