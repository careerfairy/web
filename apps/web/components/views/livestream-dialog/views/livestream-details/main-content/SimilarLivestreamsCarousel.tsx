import { FirebaseInArrayLimit } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Skeleton } from "@mui/material"
import useSimilarLivestreams from "components/custom-hook/useSimilarLivestreams"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC } from "react"
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
   limit?: FirebaseInArrayLimit
}

const SimilarLivestreamsCarousel: FC<SimilarLivestreamsCarouselProps> = ({
   currentLivestream,
   limit = 4,
}) => {
   return (
      <SimilarLivestreamsContent
         currentLivestream={currentLivestream}
         limit={limit}
      />
   )
}

const SimilarLivestreamsContent: FC<SimilarLivestreamsCarouselProps> = ({
   currentLivestream,
   limit,
}) => {
   const { events: similarEvents, loading } = useSimilarLivestreams({
      limit,
      currentLivestream,
   })

   // Don't render if no events or still loading
   if (loading) {
      return (
         <Skeleton
            variant="rectangular"
            width={367}
            height={335}
            sx={{ mt: 2, borderRadius: 2 }}
         />
      )
   }

   if (!similarEvents?.length) {
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
