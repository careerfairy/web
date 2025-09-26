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

interface RecordingsSectionConsultingProps {
   consultingRecordings: LivestreamEvent[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function RecordingsSectionConsulting({
   consultingRecordings,
   handleOpenLivestreamDialog,
}: RecordingsSectionConsultingProps) {
   // Debug: Log the recordings to see what we're getting
   console.log("RecordingsSectionConsulting - consultingRecordings:", consultingRecordings)
   console.log("RecordingsSectionConsulting - recordings count:", consultingRecordings?.length || 0)

   // If no recordings, show a message for debugging
   if (!consultingRecordings || consultingRecordings.length === 0) {
      return (
         <Stack sx={styles.carouselWrapper}>
            <Stack sx={{ gap: 0.5, mb: 1.5 }}>
               <Typography variant="brandedH5" color="text.primary">
                  Can't wait for the insights?
               </Typography>
               <Typography variant="medium" sx={styles.sectionDescription}>
                  Get ahead of everyone with the insights from consulting live streams that recently happened
               </Typography>
               <Typography variant="small" color="error" sx={{ mt: 2 }}>
                  Debug: No consulting recordings found ({consultingRecordings?.length || 0} recordings)
               </Typography>
            </Stack>
         </Stack>
      )
   }

   return (
      <Stack sx={styles.carouselWrapper}>
         <EventsPreviewCarousel
            events={consultingRecordings}
            location={ImpressionLocation.panelsOverviewPage}
            onCardClick={(event) => {
               handleOpenLivestreamDialog(event.id)
            }}
            styling={{ viewportSx: styles.viewport }}
            title={
               <Stack sx={{ gap: 0.5, mb: 1.5 }}>
                  <Typography variant="brandedH5" color="text.primary">
                     Can't wait for the insights?
                  </Typography>
                  <Typography variant="medium" sx={styles.sectionDescription}>
                     Get ahead of everyone with the insights from consulting live streams that recently happened
                  </Typography>
                  <Typography variant="small" color="success.main" sx={{ mt: 1 }}>
                     Debug: Found {consultingRecordings.length} consulting recordings
                  </Typography>
               </Stack>
            }
         />
      </Stack>
   )
}