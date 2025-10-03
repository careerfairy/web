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

interface RecordingsSectionFMCGProps {
   fmcgRecordings: LivestreamEvent[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function RecordingsSectionFMCG({
   fmcgRecordings,
   handleOpenLivestreamDialog,
}: RecordingsSectionFMCGProps) {
   // Don't render if no recordings available
   if (!fmcgRecordings || fmcgRecordings.length === 0) {
      return null
   }

   return (
      <Stack sx={styles.carouselWrapper}>
         <EventsPreviewCarousel
            events={fmcgRecordings}
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
                     Get ahead of everyone with the insights from FMCG live streams that recently happened
                  </Typography>
               </Stack>
            }
         />
      </Stack>
   )
}
