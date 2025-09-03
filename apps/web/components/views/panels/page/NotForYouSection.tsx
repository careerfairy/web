import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { Stack, Typography } from "@mui/material"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   sectionDescription: {
      color: "neutral.700",
      fontWeight: 400,
   },
   carouselWrapper: {
      width: { xs: "calc(100% + 16px)", md: "calc(100% + 32px)" },
   },
   viewport: {
      overflow: "hidden",
      // hack to ensure overflow visibility with parent padding
      paddingX: "48px",
      marginX: "-48px",
      width: "calc(100% + 48px)",
   },
})

interface NotForYouSectionProps {
   recentLivestreams: LivestreamEvent[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function NotForYouSection({
   recentLivestreams,
   handleOpenLivestreamDialog,
}: NotForYouSectionProps) {
   return (
      <Stack sx={styles.carouselWrapper}>
         <EventsPreviewCarousel
            events={recentLivestreams}
            location={ImpressionLocation.panelsOverviewPage}
            onCardClick={(livestreamId) => {
               handleOpenLivestreamDialog(livestreamId)
            }}
            styling={{ viewportSx: styles.viewport }}
            title={
               <Stack sx={{ gap: 0.5, mb: 1.5 }}>
                  <Typography variant="brandedH5" color="text.primary">
                     Not for you?
                  </Typography>
                  <Typography variant="medium" sx={styles.sectionDescription}>
                     Here are more live streams
                  </Typography>
               </Stack>
            }
         />
      </Stack>
   )
}
