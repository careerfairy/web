import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import ConditionalWrapper from "components/util/ConditionalWrapper"
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
   hideTitle?: boolean
}

const RecommendedEvents = ({ limit = 10, hideTitle }: Props) => {
   const { authenticatedUser, userData } = useAuth()

   const options = useMemo(
      () => ({
         limit,
      }),
      [limit]
   )

   const { loading, events } = useRecommendedEvents(options)

   if (!authenticatedUser?.email || !events?.length) {
      return null
   }
   return (
      <div>
         <ConditionalWrapper condition={Boolean(events?.length)}>
            <EventsPreviewCarousel
               title={!hideTitle && "Recommended for you"}
               events={events}
               location={"portal-recommended-livestreams-carousel"}
               loading={loading}
               isRecommended
               isAdmin={userData?.isAdmin}
               styling={defaultStyling}
            />
         </ConditionalWrapper>
      </div>
   )
}

export default RecommendedEvents
