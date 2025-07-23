import { ImpressionLocation, LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import SectionTitle from "./SectionTitle"

const styles = sxStyles({
   carouselContainer: {
      mt: 4, // Add space above the carousel
   },
   carouselWrapper: {
      "& > div": {
         // Target the carousel wrapper to remove default margins
         marginLeft: 0,
         marginRight: 0,
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
   const { events: similarEvents, loading } = useRecommendedEvents({
      limit: 4,
      referenceLivestreamId: currentLivestream.id,
      suspense: true,
   })

   // Don't render if no events or still loading
   if (loading || !similarEvents?.length) {
      return null
   }

   return (
      <Box sx={styles.carouselContainer}>
         <SectionTitle>Similar live streams</SectionTitle>
         <Box sx={styles.carouselWrapper}>
            <EventsPreviewCarousel
               title={null} // We already have the section title above
               events={similarEvents}
               location={`livestream-dialog-similar-events-carousel-${currentLivestream.id}`}
               isRecommended={true}
               isEmbedded={true}
                           styling={{
               mainWrapperBoxSx: {
                  mt: 2, // 16px space between title and carousel
               },
               // Remove default padding since we're in a dialog
               padding: false,
               viewportSx: {
                  py: 1.5, // Add some vertical padding for the cards
               },
            }}
            />
         </Box>
      </Box>
   )
}

export default SimilarLivestreamsCarousel