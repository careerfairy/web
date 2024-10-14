import {
   FunctionSignature,
   SparksAnalyticsDTO,
   SparkStatsFromBigQuery,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class SparksAnalyticsService {
   constructor(private readonly functions: Functions) {}

   async fetchSparksAnalytics(groupId: string): Promise<SparksAnalyticsDTO> {
      const { data: analytics } = await httpsCallable<
         FunctionSignature,
         SparksAnalyticsDTO
      >(
         this.functions,
         "getSparksAnalytics_v6"
      )({ groupId })

      return analytics
   }

   async fetchSparkStats(
      groupId: string,
      sparkId: string
   ): Promise<SparkStatsFromBigQuery> {
      const { data: stats } = await httpsCallable<
         { groupId: string; sparkId: string },
         SparkStatsFromBigQuery
      >(
         this.functions,
         "getSparkStats_v1"
      )({ groupId, sparkId })

      return stats
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sparksAnalyticsService = new SparksAnalyticsService(
   FunctionsInstance as any
)

export default SparksAnalyticsService
