import { DateTime } from "luxon"
import { LivestreamEvent } from "../livestreams"
import { UPCOMING_STREAM_THRESHOLD_MINUTES } from "../livestreams/constants"
import { makeLivestreamEventDetailsUrl } from "../utils/urls"
import { addUtmTagsToLink, AddUtmTagsToLinkProps } from "../utils/utils"

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

type OptionsGenerateCalendarEventProperties = {
   overrideBaseUrl?: string
}

export const generateCalendarEventProperties = (
   livestream: LivestreamEvent,
   customUtm?: Partial<AddUtmTagsToLinkProps>,
   options?: OptionsGenerateCalendarEventProperties
) => {
   const livestreamStartDate = DateTime.fromJSDate(livestream.start.toDate())
   const livestreamUrl = makeLivestreamEventDetailsUrl(livestream.id, options)
   const linkWithUTM = addUtmTagsToLink({
      link: livestreamUrl,
      campaign: "fromCalendarEvent",
      content: livestream.title,
      ...customUtm, // Override default UTM parameters
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
   }
}
