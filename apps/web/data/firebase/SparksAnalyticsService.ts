import { SparksAnalyticsDTO } from "@careerfairy/shared-lib/sparks/analytics"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class SparksAnalyticsService {
   constructor(private readonly functions: Functions) {}

   async fetchSparksAnalytics(
      groupId: string,
      forceUpdate: boolean
   ): Promise<SparksAnalyticsDTO> {
      const { data: analytics } = await httpsCallable<
         { groupId: string; forceUpdate: boolean },
         SparksAnalyticsDTO
      >(
         this.functions,
         "getSparksAnalytics_v4"
      )({ groupId, forceUpdate })

      return analytics
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sparksAnalyticsService = new SparksAnalyticsService(
   FunctionsInstance as any
)

export default SparksAnalyticsService
