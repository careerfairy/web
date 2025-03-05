import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Speaker } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSource } from "@careerfairy/shared-lib/sparks/telemetry"
import {
   addUtmTagsToLink,
   companyNameSlugify,
} from "@careerfairy/shared-lib/utils"
import { mainProductionDomainWithProtocol as defaultBaseUrl } from "@careerfairy/shared-lib/utils/urls"
import { DateTime } from "luxon"
import { JobData, SparkData, SpeakerData } from "./EmailTypes"

type UTMParams = {
   source?: string
   medium?: string
   campaign?: string
   term?: string
   content?: string
}

type GetJobEmailDataOptions = {
   baseUrl: string
   livestreamId: string
   utmParams?: UTMParams
}

export const getJobEmailData = (
   job: CustomJob | PublicCustomJob,
   options: GetJobEmailDataOptions
): JobData => {
   return {
      url: addUtmTagsToLink({
         link: `${options.baseUrl || defaultBaseUrl}/portal/livestream/${
            options.livestreamId
         }/job-details/${job.id}`,
         ...options.utmParams,
      }),
      title: job.title,
      jobType: job.jobType,
      businessFunctionsTags: job.businessFunctionsTagIds
         .map((tag) => TagValuesLookup[tag])
         .join(", "),
      deadline: DateTime.fromJSDate(job.deadline.toDate()).toFormat(
         "dd LLL yyyy"
      ),
   }
}

type GetSparkEmailDataOptions = {
   baseUrl: string
   interactionSource: SparkInteractionSource
   utmParams?: UTMParams
}

export const getSparkEmailData = (
   spark: Spark,
   options: GetSparkEmailDataOptions
): SparkData => {
   return {
      question: spark.question,
      category_id: spark.category.name,
      thumbnailUrl: spark.video.thumbnailUrl,
      url: addUtmTagsToLink({
         link: `${options.baseUrl}/sparks/${
            spark.id
         }?companyName=${companyNameSlugify(
            spark.group.universityName
         )}&groupId=${spark.group.id}&interactionSource=${
            options.interactionSource
         }`,
         ...options.utmParams,
      }),
   }
}

type GetSpeakerEmailDataOptions = {
   baseUrl: string
   livestreamId: string
   utmParams?: UTMParams
}

export const getSpeakerEmailData = (
   speaker: Speaker,
   options: GetSpeakerEmailDataOptions
): SpeakerData => {
   return {
      name: `${speaker.firstName} ${speaker.lastName}`,
      position: speaker.position,
      avatarUrl: speaker.avatar,
      url: addUtmTagsToLink({
         link: `${options.baseUrl || defaultBaseUrl}/portal/livestream/${
            options.livestreamId
         }/speaker-details/${speaker.id}`,
         ...options.utmParams,
      }),
   }
}
