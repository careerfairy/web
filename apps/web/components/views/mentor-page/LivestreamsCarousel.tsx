import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import EventPreviewCard from "../common/stream-cards/EventPreviewCard"
import { ContentCarousel } from "./ContentCarousel"

const CARD_WIDTH = 328
const CARD_HEIGHT = 268

const styles = sxStyles({
   viewport: {
      // hack to ensure shadows are not cut off
      padding: "16px",
      margin: "-16px",
      width: "calc(100% + 16px)",
   },
   mobileCarouselContainer: {
      gap: "32px !important",
   },
   cardWrapper: {
      width: CARD_WIDTH,
      minHeight: CARD_HEIGHT,
   },
   lastCard: {
      paddingRight: "16px",
   },
})

type LivestreamsCarouselProps = {
   livestreams: LivestreamEvent[]
}

export const LivestreamsCarousel = ({
   livestreams,
}: LivestreamsCarouselProps) => {
   const isMobile = useIsMobile()

   return (
      <ContentCarousel
         headerTitle="Live streams"
         slideWidth={CARD_WIDTH}
         viewportSx={styles.viewport}
         containerSx={isMobile ? styles.mobileCarouselContainer : null}
      >
         {livestreams.map((livestream, index) => (
            <Box
               key={livestream.id}
               sx={[
                  styles.cardWrapper,
                  index === livestreams.length - 1 ? styles.lastCard : {},
               ]}
            >
               <EventPreviewCard
                  key={livestream.id}
                  index={index}
                  totalElements={livestreams.length}
                  location={ImpressionLocation.mentorPageCarousel}
                  event={livestream}
               />
            </Box>
         ))}
      </ContentCarousel>
   )
}
