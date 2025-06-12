import { DateTime } from "luxon"
import { TagValuesLookup } from "../constants/tags"
import { CustomJob, JobType, PublicCustomJob } from "../customJobs/customJobs"
import { Speaker } from "../livestreams/livestreams"
import { Spark } from "../sparks/sparks"
import { SparkInteractionSource } from "../sparks/telemetry"
import { addUtmTagsToLink, companyNameSlugify } from "../utils"
import { mainProductionDomainWithProtocol as defaultBaseUrl } from "../utils/urls"

type UTMParams = {
   source?: string
   medium?: string
   campaign?: string
   term?: string
   content?: string
}

export type JobData = {
   url: string
   title: string
   jobType: JobType
   businessFunctionsTags: string
   deadline: string
}

export type SpeakerData = {
   name: string
   position: string
   avatarUrl: string
   url: string
   linkedInUrl: string
}

export type SparkData = {
   question: string
   category_id: string
   thumbnailUrl: string
   url: string
}

export type CalendarData = {
   google: string
   apple: string
   outlook: string
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
      linkedInUrl: speaker.linkedInUrl,
   }
}
