import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import SectionTitle from "./SectionTitle"

const styles = sxStyles({
   carouselWrapper: {
      "& > div": {
         marginLeft: 0,
         marginRight: 0,
         paddingLeft: 0,
         paddingRight: 0,
      },
   },
})

type SimilarLivestreamsCarouselProps = {
   currentLivestream: LivestreamEvent
}

const SimilarLivestreamsCarousel: FC<SimilarLivestreamsCarouselProps> = ({
   currentLivestream,
}) => {
   return (
      <SuspenseWithBoundary fallback={null}>
         <SimilarLivestreamsContent currentLivestream={currentLivestream} />
      </SuspenseWithBoundary>
   )
}

const SimilarLivestreamsContent: FC<SimilarLivestreamsCarouselProps> = ({
   currentLivestream,
}) => {
   const recommendedEventsConfig = useMemo(
      () => ({
         limit: 4,
         referenceLivestreamId: currentLivestream.id,
         suspense: true,
      }),
      [currentLivestream.id]
   )

   const { events: similarEvents, loading } = useRecommendedEvents(recommendedEventsConfig)

   // Don't render if no events or still loading
   if (loading || !similarEvents?.length) {
      return null
   }

   return (
      <Box>
         <SectionTitle>Similar live streams</SectionTitle>
         <Box sx={styles.carouselWrapper}>
            <EventsPreviewCarousel
               title={null} // We already have the section title above
               events={similarEvents}
               location={`livestream-dialog-similar-events-carousel-${currentLivestream.id}`}
               isRecommended
               isEmbedded
               styling={{
                  padding: false,
               }}
            />
         </Box>
      </Box>
   )
}

export default SimilarLivestreamsCarousel