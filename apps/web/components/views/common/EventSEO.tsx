import React from "react"
import { Event } from "schema-dts"

interface EventSEOProps {
   eventName: string
   eventDate: Date
   detailPageUrl: string
   eventImageUrl: string
   eventDescription: string
   eventCompany: string
}
const EventSEO = ({
   eventDate,
   eventDescription,
   eventName,
   eventImageUrl,
   detailPageUrl,
   eventCompany,
}: EventSEOProps) => {
   const event: Event = {
      "@type": "Event",
      name: eventName,
      startDate: eventDate?.toISOString?.(),
      endDate: eventDate?.toISOString?.(),
      description: eventDescription,
      url: detailPageUrl,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
         "@type": "VirtualLocation",
         url: detailPageUrl,
         image: "https://www.careerfairy.io/logo_teal.svg",
         name: "CareerFairy",
         description:
            "CareerFairy is a career platform for students and jobseekers.",
      },
      image: eventImageUrl,
      organizer: {
         "@type": "Organization",

         name: eventCompany,

         url: detailPageUrl,
      },
   }

   return (
      <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
            __html: JSON.stringify({
               "@context": "https://schema.org",
               ...event,
            }),
         }}
      />
   )
}

export default EventSEO
