import {
   LivestreamEvent,
   LiveStreamEventWithUsersLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { createCalendarEvent } from "@careerfairy/shared-lib/utils"
import {
   getLivestreamICSDownloadUrl,
   makeUrls,
} from "@careerfairy/shared-lib/utils/utils"
import { isLocalEnvironment } from "../util"

export interface CalendarData {
   google: string
   apple: string
   outlook: string
}

/**
 * Generates calendar data (Google, Apple, Outlook links) for a livestream event
 * for use in email templates and other notifications
 */
export function generateCalendarData(
   stream: LivestreamEvent | LiveStreamEventWithUsersLivestreamData,
   utmCampaign = "fromcalendarevent-mail"
): CalendarData {
   const calendarEvent = createCalendarEvent(stream)
   const urls = makeUrls(calendarEvent)

   return {
      google: urls.google,
      apple: getLivestreamICSDownloadUrl(stream.id, isLocalEnvironment(), {
         utmCampaign,
      }),
      outlook: urls.outlook,
   }
}
