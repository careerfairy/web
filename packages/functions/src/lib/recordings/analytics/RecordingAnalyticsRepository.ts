import { RecordingStatsFromBigQuery } from "@careerfairy/shared-lib/livestreams/recordings"
import { BigQuery } from "@google-cloud/bigquery"
import IBigQueryService from "../../bigQuery/IBigQueryService"
import { recordingViews } from "./queries/RecordingViews"

interface IRecordingAnalyticsRepository {
   getRecordingViews(livestreamId: string): Promise<RecordingStatsFromBigQuery>
}

class RecordingAnalyticsRepository implements IRecordingAnalyticsRepository {
   private bigQueryService: IBigQueryService

   constructor(bigQueryClient: BigQuery) {
      this.bigQueryService = new IBigQueryService(bigQueryClient)
   }

   private async handleQueryPromise<T>(
      sqlQuery: string,
      params?: object
   ): Promise<T> {
      const [rows] = await this.bigQueryService.query(sqlQuery, params)
      return rows as T
   }

   async getRecordingViews(
      livestreamId: string
   ): Promise<RecordingStatsFromBigQuery> {
      const params = { livestreamId }
      const rows = await this.handleQueryPromise<
         Array<{ total_views: number; unique_viewers: number }>
      >(recordingViews, params)
      const row = rows[0] || { total_views: 0, unique_viewers: 0 }

      return {
         totalViews: row.total_views,
         uniqueViewers: row.unique_viewers,
      }
   }
}

export default RecordingAnalyticsRepository
