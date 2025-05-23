import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { RecordingStatsFromBigQuery } from "@careerfairy/shared-lib/livestreams/recordings"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class RecordingsService {
   constructor(private readonly functions: Functions) {}

   async fetchRecordingViews(
      livestreamId: string
   ): Promise<RecordingStatsFromBigQuery> {
      const { data: stats } = await httpsCallable<
         { livestreamId: string },
         RecordingStatsFromBigQuery
      >(
         this.functions,
         FUNCTION_NAMES.getRecordingViews
      )({ livestreamId })

      return stats
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recordingsService = new RecordingsService(FunctionsInstance as any)

export default RecordingsService
