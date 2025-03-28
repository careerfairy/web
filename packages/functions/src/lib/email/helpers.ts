import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { DateTime } from "luxon"
import {
   getJobEmailData,
   getSparkEmailData,
   getSpeakerEmailData,
} from "../notifications/util"

/**
 * Prepares speaker data for email templates
 */
export const prepareEmailSpeakers = (
   livestream: LivestreamEvent,
   baseUrl: string,
   utmCampaign: string
) => {
   const livestreamSpeakers = livestream.speakers ?? []

   return livestreamSpeakers.slice(0, 4).map((speaker) => {
      return getSpeakerEmailData(speaker, {
         baseUrl,
         livestreamId: livestream.id,
         utmParams: {
            campaign: utmCampaign,
            content: livestream.title,
         },
      })
   })
}

/**
 * Prepares job data for email templates
 */
export const prepareEmailJobs = (
   livestream: LivestreamEvent,
   baseUrl: string,
   jobs: CustomJob[],
   utmCampaign: string
) => {
   if (!jobs) {
      return []
   }

   return jobs.slice(0, 5).map((job) =>
      getJobEmailData(job, {
         baseUrl,
         livestreamId: livestream.id,
         utmParams: {
            campaign: utmCampaign,
            content: livestream.title,
         },
      })
   )
}

/**
 * Prepares spark data for email templates
 */
export const prepareEmailSparks = (
   sparks: Spark[],
   livestream: LivestreamEvent,
   baseUrl: string,
   utmCampaign: string
) => {
   if (!sparks) {
      return []
   }

   return sparks
      .sort((sparkA, sparkB) => {
         return sparkB.publishedAt.toMillis() - sparkA.publishedAt.toMillis()
      })
      .slice(0, 3)
      .map((spark) =>
         getSparkEmailData(spark, {
            baseUrl,
            interactionSource: SparkInteractionSources.RegistrationEmail,
            utmParams: {
               campaign: utmCampaign,
               content: livestream.title,
            },
         })
      )
}

/**
 * Formats the livestream start date
 */
export const formatLivestreamStartDate = (
   livestream: LivestreamEvent,
   timezone = "Europe/Zurich"
) => {
   const livestreamStartDate = DateTime.fromJSDate(livestream.start.toDate(), {
      zone: timezone,
   })

   return livestreamStartDate.toFormat("dd LLLL yyyy 'at' hh:mm a '(GMT' Z')'")
}
