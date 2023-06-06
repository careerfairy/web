import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/src/utils/urls"
import React, { useMemo } from "react"
import { Event } from "schema-dts"
import {
   addMinutes,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"

interface EventSEOProps {
   event: LivestreamEvent
}
const EventSEOSchemaScriptTag = ({ event }: EventSEOProps) => {
   const data = useMemo(
      () => ({
         startDate: event?.startDate
            ? new Date(event?.startDate)
            : event.start
            ? event.start.toDate?.()
            : new Date(),
         eventCompanyImageUrl: getResizedUrl(event?.companyLogoUrl, "md"),
         companyImageXSmall: getResizedUrl(event?.companyLogoUrl, "xs"),
         companyImageSmall: getResizedUrl(event?.companyLogoUrl, "sm"),
         companyImageMedium: getResizedUrl(event?.companyLogoUrl, "md"),
         companyImageLarge: getResizedUrl(event?.companyLogoUrl, "lg"),
         eventName: event?.title,
         eventDescription: event?.summary,
         eventCompanyName: event?.company,
         url: makeLivestreamEventDetailsUrl(event?.id),
         duration: event?.duration || 60,
      }),
      [event]
   )
   const eventSchema: Event = {
      "@type": "Event",
      name: data.eventName,
      startDate: data.startDate.toISOString(),
      endDate: addMinutes(data.startDate, data.duration)?.toISOString?.(),
      description: data.eventDescription,
      url: data.url,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
         "@type": "VirtualLocation",
         url: data.url,
         image: "https://www.careerfairy.io/logo_teal.svg",
         name: "CareerFairy",
         description:
            "CareerFairy is a career platform for students and jobseekers.",
      },
      performer: {
         "@type": "Organization",
         name: data.eventCompanyName,
         logo: data.eventCompanyImageUrl,
      },
      offers: {
         "@type": "Offer",
         availabilityEnds: addMinutes(
            data.startDate,
            data.duration
         )?.toISOString?.(),
         availabilityStarts: data.startDate.toISOString(),
         price: "0",
         priceCurrency: "CHF",
         url: data.url,
         validFrom: data.startDate.toISOString(),
         availability: "https://schema.org/InStock",
      },
      image: [
         data.companyImageXSmall,
         data.companyImageSmall,
         data.companyImageMedium,
         data.companyImageLarge,
      ],
      organizer: {
         "@type": "Organization",
         name: data.eventCompanyName,
         url: data.url,
      },
   }

   return (
      <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
            __html: JSON.stringify({
               "@context": "https://schema.org",
               ...eventSchema,
            }),
         }}
      />
   )
}

export default EventSEOSchemaScriptTag
