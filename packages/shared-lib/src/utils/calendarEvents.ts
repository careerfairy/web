import { DateTime } from "luxon"
import { LivestreamEvent } from "../livestreams"
import { UPCOMING_STREAM_THRESHOLD_MINUTES } from "../livestreams/constants"
import { makeLivestreamEventDetailsUrl } from "../utils/urls"
import { addUtmTagsToLink } from "../utils/utils"

type Options = {
   userTimezone: string
}

const getBrowserTimeZone = () => {
   try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || ""
   } catch (error) {
      console.warn("Error getting browser timezone:", error)
      return ""
   }
}

const MAX_DESCRIPTION_LENGTH = 1000
const EVENT_LINK_PLACEHOLDER = "[EVENT_LINK]"

const buildDescription = (parts: string[], eventLink: string): string => {
   let description = parts.join("\n\n")
   description += `\n\n${EVENT_LINK_PLACEHOLDER}`

   if (description.length > MAX_DESCRIPTION_LENGTH) {
      const availableSpace = MAX_DESCRIPTION_LENGTH - eventLink.length
      description = description.slice(0, availableSpace - 3) + "..."
   }

   return description.replace(EVENT_LINK_PLACEHOLDER, eventLink)
}

export const generateCalendarEventProperties = (
   livestream: LivestreamEvent,
   { userTimezone }: Options
) => {
   const browserTimeZone = getBrowserTimeZone()
   const livestreamTimeZone = userTimezone || browserTimeZone || "Europe/Zurich"

   const livestreamStartDate = DateTime.fromJSDate(livestream.start.toDate(), {
      zone: livestreamTimeZone,
   })
   const livestreamUrl = makeLivestreamEventDetailsUrl(livestream.id)
   const linkWithUTM = addUtmTagsToLink({
      link: livestreamUrl,
      campaign: "fromCalendarEvent",
      content: livestream.title,
   })

   const eventLink = `Event link: ${linkWithUTM}`
   const descriptionParts = [
      "Join the live stream!",
      livestream.summary,
      "Reasons to join:",
      ...(livestream.reasonsToJoinLivestream_v2 || [])
         .slice(0, 3)
         .map((reason) => `• ${reason}`),
   ].filter(Boolean)

   const description = buildDescription(descriptionParts, eventLink)

   return {
      start: livestreamStartDate.toJSDate(),
      end: livestreamStartDate
         .plus({
            minutes: livestream.duration || UPCOMING_STREAM_THRESHOLD_MINUTES,
         })
         .toJSDate(),
      summary: livestream.title,
      description,
      location: livestream.isHybrid ? livestream.address : linkWithUTM,
      url: linkWithUTM,
      organizer: {
         name: `CareerFairy - ${livestream.company}`,
         email: "noreply@careerfairy.io",
      },
      timezone: livestreamTimeZone,
   }
}
