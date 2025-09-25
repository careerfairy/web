import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { useMemo } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useRecommendedEvents from "../../../custom-hook/useRecommendedEvents"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
} from "./EventsPreviewCarousel"

const defaultStyling: EventsCarouselStyling = {
   mainWrapperBoxSx: {
      mt: 2,
   },
}

type Props = {
   limit?: FirebaseInArrayLimit
   title?: string
   hideTitle?: boolean
}

const RecommendedEvents = ({
   limit = 10,
   hideTitle,
   title = "Recommended for you",
}: Props) => {
   const { userData } = useAuth()

   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   return (
      <div>
         <EventsPreviewCarousel
            title={!hideTitle && title}
            events={events}
            location={"portal-recommended-livestreams-carousel"}
            loading={loading}
            isRecommended
            isAdmin={userData?.isAdmin}
            styling={defaultStyling}
         />
      </div>
   )
}

export default RecommendedEvents
