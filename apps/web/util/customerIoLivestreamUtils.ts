import { toUnixTimestamp } from "@careerfairy/shared-lib/customerio/util"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   addUtmTagsToLink,
   createCalendarEvent,
   getLivestreamICSDownloadUrl,
   makeUrls,
} from "@careerfairy/shared-lib/utils/utils"
import { getBaseUrl } from "../components/helperFunctions/HelperFunctions"
import { errorLogAndNotify, shouldUseEmulators } from "./CommonUtil"

/**
 * Types for Customer.io-specific data structures
 * These mirror the email template types but are specific to Customer.io campaigns
 */
export type CustomerIoSpeakerData = {
   id: string
   name: string
   position: string
   avatarUrl: string
   url: string
   linkedInUrl: string
}

/**
 * Options for preparing Customer.io data
 */
export type PrepareCustomerIoDataOptions = {
   baseUrl: string
   utmCampaign: string
   isLocalEnvironment?: boolean
}

/**
 * Prepares speaker data for Customer.io campaigns
 */
export const prepareLivestreamSpeakers = (
   livestream: LivestreamEvent,
   options: PrepareCustomerIoDataOptions
): CustomerIoSpeakerData[] => {
   const speakers = livestream.speakers ?? []

   return speakers.slice(0, 3).map((speaker) => ({
      id: speaker.id,
      name: `${speaker.firstName} ${speaker.lastName}`,
      position: speaker.position,
      avatarUrl: speaker.avatar,
      url: addUtmTagsToLink({
         link: `${options.baseUrl}/portal/livestream/${livestream.id}/speaker-details/${speaker.id}`,
         campaign: options.utmCampaign,
         content: livestream.title,
      }),
      linkedInUrl: speaker.linkedInUrl,
   }))
}

/**
 * Prepares calendar data for Customer.io campaigns
 */
export const prepareLivestreamCalendar = (
   livestream: LivestreamEvent,
   options: PrepareCustomerIoDataOptions
) => {
   const calendarEvent = createCalendarEvent(livestream, {
      campaign: "fromcalendarevent-mail",
   })

   if (!calendarEvent) {
      return {
         google: "",
         outlook: "",
         apple: "",
      }
   }

   const urls = makeUrls(calendarEvent)

   return {
      google: urls.google,
      outlook: urls.outlook,
      apple: getLivestreamICSDownloadUrl(
         livestream.id,
         options.isLocalEnvironment,
         {
            utmCampaign: "fromcalendarevent-mail",
         }
      ),
   }
}

/**
 * Prepares enhanced Customer.io data for email campaigns
 * This data can be passed as optionalVariables to dataLayerLivestreamEvent
 */
export const prepareLivestreamCustomerIoVariables = (
   livestream: LivestreamEvent
) => {
   try {
      const options = {
         baseUrl: getBaseUrl(),
         utmCampaign: "event-registration-event",
         isLocalEnvironment: shouldUseEmulators(),
      }

      return {
         // Calendar URLs for add-to-calendar functionality
         calendarLinks: prepareLivestreamCalendar(livestream, options),

         // Mentor/speaker details (up to 3)
         speakers: prepareLivestreamSpeakers(livestream, options),

         // Additional meta for Customer.io
         speakerCount: livestream.speakers?.length || 0,

         // Banner URL for email dynamic images
         backgroundImageUrl: livestream.backgroundImageUrl,
         livestreamStartDate: toUnixTimestamp(livestream.start),
      }
   } catch (error) {
      errorLogAndNotify(error, {
         message: "Failed to prepare enhanced Customer.io data",
      })
      return {}
   }
}
