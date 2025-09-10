import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { Stack, Typography } from "@mui/material"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import { useAuth } from "HOCs/AuthProvider"
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
   const { authenticatedUser, userData } = useAuth()
   const hasInterests = Boolean(
      authenticatedUser?.email || userData?.interestsIds
   )

   const { events: recommendedEvents } = useRecommendedEvents({
      limit: 10,
   })

   const showingRecommended = hasInterests && Boolean(recommendedEvents?.length)
   const eventsToShow = showingRecommended
      ? recommendedEvents
      : recentLivestreams

   return (
      <Stack sx={styles.carouselWrapper}>
         <EventsPreviewCarousel
            events={eventsToShow}
            location={ImpressionLocation.panelsOverviewPage}
            isRecommended={showingRecommended}
            onCardClick={(event) => {
               handleOpenLivestreamDialog(event.id)
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
