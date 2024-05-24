import { CustomJobApplicant } from "../../customJobs/customJobs"
import { LivestreamEvent } from "../../livestreams"
import { Spark } from "../../sparks/sparks"
import { CompanyFollowed } from "../../users"

export type ImplicitLivestreamRecommendationData = {
   watchedLivestreams: LivestreamEvent[] // most recently watched live streams (both live and recordings)
   watchedSparks: Spark[] // most recently watched Sparks
   appliedJobs: CustomJobApplicant[] // most recent job applications
   followedCompanies: CompanyFollowed[]
}
