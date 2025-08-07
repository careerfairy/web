import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box } from "@mui/material"
import useSimilarLivestreams from "components/custom-hook/useSimilarLivestreams"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import Section from "./Section"
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
   return <SimilarLivestreamsContent currentLivestream={currentLivestream} />
}

const SimilarLivestreamsContent: FC<SimilarLivestreamsCarouselProps> = ({
   currentLivestream,
}) => {
   const similarLivestreamsConfig = useMemo(
      () => ({
         limit: 4 as const,
         currentLivestream,
      }),
      [currentLivestream]
   )

   const { events: similarEvents, loading } = useSimilarLivestreams(
      similarLivestreamsConfig
   )

   // Don't render if no events or still loading
   if (loading || !similarEvents?.length) {
      return null
   }

   return (
      <Section>
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
      </Section>
   )
}

export default SimilarLivestreamsCarousel
