import { CustomJob } from "../../customJobs/customJobs"
import { LivestreamEvent } from "../../livestreams"
import { Spark } from "../../sparks/sparks"

export type ImplicitLivestreamRecommendationData = {
   watchedLivestreams: LivestreamEvent[] // most recently watched live streams (both live and recordings)
   watchedSparks: Spark[] // most recently watched Sparks
   appliedJobs: CustomJob[] // most recent job applications
}
