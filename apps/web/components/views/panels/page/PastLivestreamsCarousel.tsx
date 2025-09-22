import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { sxStyles } from "types/commonTypes"

const CARD_WIDTH = 328
const CARD_HEIGHT = 268

const styles = sxStyles({
   section: {
      gap: 3,
   },
   titleContainer: {
      textAlign: "center",
      gap: 1,
   },
   title: {
      color: "text.primary",
      fontWeight: 700,
   },
   subtitle: {
      color: "text.secondary",
   },
   viewport: {
      // hack to ensure shadows are not cut off
      padding: "16px",
      margin: "-16px",
      width: "calc(100% + 32px)",
   },
   cardWrapper: {
      width: CARD_WIDTH,
      minHeight: CARD_HEIGHT,
      height: "100%",
   },
})

type PastLivestreamsCarouselProps = {
   livestreams: LivestreamEvent[]
   onCardClick: (livestreamId: string) => void
}

export default function PastLivestreamsCarousel({
   livestreams,
   onCardClick,
}: PastLivestreamsCarouselProps) {
   if (!livestreams || livestreams.length === 0) {
      return null
   }

   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.titleContainer}>
            <Typography variant="desktopBrandedH4" sx={styles.title}>
               Can&apos;t wait for the insights?
            </Typography>
            <Typography variant="brandedBody" sx={styles.subtitle}>
               Get ahead of everyone with the insights from live streams that
               already happened
            </Typography>
         </Stack>

         <ContentCarousel slideWidth={CARD_WIDTH} viewportSx={styles.viewport}>
            {livestreams.map((livestream, index) => (
               <Box key={livestream.id} sx={styles.cardWrapper}>
                  <EventPreviewCard
                     key={livestream.id}
                     index={index}
                     totalElements={livestreams.length}
                     location={ImpressionLocation.panelsOverviewPage}
                     event={livestream}
                     onCardClick={() => onCardClick(livestream.id)}
                  />
               </Box>
            ))}
         </ContentCarousel>
      </Stack>
   )
}
