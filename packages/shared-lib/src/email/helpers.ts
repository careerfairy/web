import { DateTime } from "luxon"
import { CustomJob } from "../customJobs/customJobs"
import {
   LivestreamEvent,
   LiveStreamEventWithUsersLivestreamData,
} from "../livestreams"
import { Spark } from "../sparks/sparks"
import { SparkInteractionSources } from "../sparks/telemetry"
import {
   CalendarData,
   getJobEmailData,
   getSparkEmailData,
   getSpeakerEmailData,
} from "./emailData"

import {
   createCalendarEvent,
   getLivestreamICSDownloadUrl,
   makeUrls,
} from "../utils"

type GenerateCalendarOptions = {
   utmCampaign?: string
   isLocalEnvironment?: boolean
}

/**
 * Generates calendar data (Google, Apple, Outlook links) for a livestream event
 * for use in email templates and other notifications
 */
export function generateCalendarData(
   stream: LivestreamEvent | LiveStreamEventWithUsersLivestreamData,
   options: GenerateCalendarOptions = {}
): CalendarData {
   const calendarEvent = createCalendarEvent(stream)
   const urls = makeUrls(calendarEvent)

   return {
      google: urls.google,
      apple: getLivestreamICSDownloadUrl(
         stream.id,
         options.isLocalEnvironment,
         {
            utmCampaign: options.utmCampaign,
         }
      ),
      outlook: urls.outlook,
   }
}

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
