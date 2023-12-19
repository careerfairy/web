import React, { useMemo, useRef } from "react"
import EventsPreview, { EventsTypes } from "./EventsPreview"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import EventsPreviewCarousel, { ChildRefType } from "./EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"

const RecommendedEvents = ({ limit = 10, hideTitle }: Props) => {
   const { authenticatedUser } = useAuth()
   const emblaOptions: EmblaOptionsType = {
      slidesToScroll: "auto",
      containScroll: "trimSnaps",
      axis: "y",
   }

   const childRef = useRef<ChildRefType | null>(null)
   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   const eventsCarouselEmblaOptions = useMemo<EmblaOptionsType>(
      () => ({
         axis: "x",
         loop: false,
         align: "center",
         // duration: 15,
         dragThreshold: 0.5,
         // asdsa: "dsfs",
         // dragFree: false,
         dragFree: false,
         inViewThreshold: 0,
         /**
          * Custom function to watch for changes to the slides.
          * Reloads the Embla Carousel whenever the slides (sparks) are updated,
          * to prevent flickering.
          */
         watchSlides: (emblaApi) => {
            const reloadEmbla = (): void => {
               const oldEngine = emblaApi.internalEngine()
               emblaApi.reInit()

               console.log("Re-Init Embla in Watch")
            }

            reloadEmbla()
         },
      }),
      [events]
   )

   if (!authenticatedUser?.email || !events?.length) {
      return null
   }
   // Switch to emblaApi
   return (
      <div>
         <EventsPreview
            limit={limit}
            title={!hideTitle && "RECOMMENDED FOR YOU"}
            events={events}
            type={EventsTypes.recommended}
            loading={loading}
            isRecommended
         />
         <EventsPreviewCarousel
            options={eventsCarouselEmblaOptions}
            limit={limit}
            title={!hideTitle && "RECOMMENDED FOR YOU - EMBLA"}
            events={events}
            type={EventsTypes.recommended}
            loading={loading}
            isRecommended
            isAdmin={true}
            hidePreview={false}
            ref={childRef}
         />
      </div>
   )
}

interface Props {
   limit?: FirebaseInArrayLimit
   hideTitle?: boolean
}

export default RecommendedEvents
