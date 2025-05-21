import { CallableRequest, onCall } from "firebase-functions/https"
import { object, string } from "yup"
import { getRecordingAnalyticsRepoInstance } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "./middlewares/cacheMiddleware"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import functions = require("firebase-functions")

const cache = (cacheKeyFn: CacheKeyOnCallFn) =>
   cacheOnCallValues("recordingViews", cacheKeyFn, 300) // 5min

// Define a cache key function specific to recording views
const recordingViewsCacheKey = (data: { livestreamId: string }): any[] => {
   return ["getRecordingViews", data.livestreamId]
}

interface GetRecordingViewsData extends Record<string, unknown> {
   livestreamId: string
}

export const getRecordingViews = onCall(
   middlewares<GetRecordingViewsData>(
      dataValidation(
         object({
            livestreamId: string().required(),
         })
      ),
      cache((request) => recordingViewsCacheKey(request.data)),
      async (request: CallableRequest<GetRecordingViewsData>) => {
         try {
            const { livestreamId } = request.data
            const recordingAnalyticsRepo = getRecordingAnalyticsRepoInstance()

            functions.logger.info(
               `Fetching recording views for livestream ${livestreamId}...`
            )

            const recordingViewsData =
               await recordingAnalyticsRepo.getRecordingViews(livestreamId)

            return recordingViewsData
         } catch (error) {
            logAndThrow("Error fetching recording views", {
               request,
               error,
            })
         }
      }
   )
)
