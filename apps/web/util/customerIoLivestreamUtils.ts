import { toUnixTimestamp } from "@careerfairy/shared-lib/customerio/util"
import {
   generateCalendarData,
   prepareEmailSpeakers,
} from "@careerfairy/shared-lib/email/helpers"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { getBaseUrl } from "../components/helperFunctions/HelperFunctions"
import { errorLogAndNotify, shouldUseEmulators } from "./CommonUtil"

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
         calendarLinks: generateCalendarData(livestream, options),

         // Mentor/speaker details (up to 3)
         speakers: prepareEmailSpeakers(
            livestream,
            options.baseUrl,
            options.utmCampaign
         ),

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
