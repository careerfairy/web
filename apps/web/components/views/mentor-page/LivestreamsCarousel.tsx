import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import { ReactNode } from "react"
import { ContentCarousel } from "../common/carousels/ContentCarousel"
import EventPreviewCard from "../common/stream-cards/EventPreviewCard"

const CARD_WIDTH = 328
const CARD_HEIGHT = 268

const styles = sxStyles({
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

type LivestreamsCarouselProps = {
   livestreams: LivestreamEvent[]
   title?: string | ReactNode
}

export const LivestreamsCarousel = ({
   livestreams,
   title = "Live streams",
}: LivestreamsCarouselProps) => {
   return (
      <ContentCarousel
         headerTitle={title}
         slideWidth={CARD_WIDTH}
         viewportSx={styles.viewport}
      >
         {livestreams.map((livestream, index) => (
            <Box key={livestream.id} sx={styles.cardWrapper}>
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
