import { DateTime } from "luxon"
import { LivestreamEvent } from "../livestreams"
import { UPCOMING_STREAM_THRESHOLD_MINUTES } from "../livestreams/constants"
import { makeLivestreamEventDetailsUrl } from "../utils/urls"
import { addUtmTagsToLink } from "../utils/utils"

export const generateCalendarEventProperties = (
   livestream: LivestreamEvent,
   { userTimezone }: { userTimezone: string }
) => {
   const livestreamTimeZone = userTimezone || "Europe/Zurich"
   const livestreamStartDate = DateTime.fromISO(
      livestream.start.toDate().toISOString(),
      {
         zone: livestreamTimeZone,
      }
   )
   const livestreamUrl = makeLivestreamEventDetailsUrl(livestream.id)
   const linkWithUTM = addUtmTagsToLink({
      link: livestreamUrl,
      campaign: "fromCalendarEvent",
      content: livestream.title,
   })

   let description = "Join the event now!\n\n"
   if (livestream.summary) {
      description += `Summary: ${livestream.summary}\n\n`
   }
   if (
      livestream.reasonsToJoinLivestream_v2 &&
      livestream.reasonsToJoinLivestream_v2.length > 0
   ) {
      description += `Reasons to join:\n${livestream.reasonsToJoinLivestream_v2
         .map((reason) => `- ${reason}`)
         .join("\n")}\n\n`
   }
   description += `Event link: ${linkWithUTM}`

   return {
      start: livestreamStartDate.toJSDate(),
      end: livestreamStartDate
         .plus({
            minutes: livestream.duration || UPCOMING_STREAM_THRESHOLD_MINUTES,
         })
         .toJSDate(),
      summary: livestream.title,
      description: description,
      location: livestream.isHybrid ? livestream.address : linkWithUTM,
      url: linkWithUTM,
      organizer: {
         name: `CareerFairy - ${livestream.company}`,
         email: "noreply@careerfairy.io",
      },
      timezone: livestreamTimeZone,
   }
}
