import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"
import { useMemo } from "react"
import { Event } from "schema-dts"
import {
   addMinutes,
   getBaseUrl,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"

interface EventSEOProps {
   event: LivestreamEvent
}

const nextYear = new Date().getFullYear() + 1

const EventSEOSchemaScriptTag = ({ event }: EventSEOProps) => {
   const data = useMemo(
      () => ({
         startDate: event?.startDate
            ? new Date(event?.startDate)
            : event.start
            ? event.start.toDate?.()
            : new Date(nextYear, 0, 8, 14, 1, 0), // Use a fixed date for placeholder events
         eventCompanyImageUrl: getResizedUrl(event?.companyLogoUrl, "md"),
         companyImageXSmall: getResizedUrl(event?.companyLogoUrl, "xs"),
         companyImageSmall: getResizedUrl(event?.companyLogoUrl, "sm"),
         companyImageMedium: getResizedUrl(event?.companyLogoUrl, "md"),
         companyImageLarge: getResizedUrl(event?.companyLogoUrl, "lg"),
         eventName: event?.title,
         eventDescription: event?.summary,
         eventCompanyName: event?.company,
         url: makeLivestreamEventDetailsUrl(event?.id, {
            overrideBaseUrl: getBaseUrl(),
         }),
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
