import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import EventPreviewCard from "../common/stream-cards/EventPreviewCard"
import { ContentCarousel } from "./ContentCarousel"

const styles = sxStyles({
   carouselContainer: {
      width: "100%",
      gap: "12px",
      overflow: "visible !important",
   },
   cardWrapper: {
      flex: {
         xs: `0 0 90%`,
         sm: `0 0 45%`,
         md: `0 0 40%`,
         lg: `0 0 30%`,
      },

      minWidth: 0,
      position: "relative",
      height: {
         xs: 363,
         md: 363,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(21px - 5px)`,
      },
      "&:first-of-type": {
         ml: 0.3,
      },
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
   return (
      <ContentCarousel headerTitle="Live streams" slideWidth={363}>
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
