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
      paddingX: "48px",
      marginX: "-48px",
      width: "calc(100% + 48px)",
   },
})

export interface RecordingsSectionConfig {
   title: string
   description: string
   impressionLocation: ImpressionLocation
}

interface RecordingsSectionProps {
   config: RecordingsSectionConfig
   recordings: LivestreamEvent[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function RecordingsSection({
   config,
   recordings,
   handleOpenLivestreamDialog,
}: RecordingsSectionProps) {
   if (!recordings || recordings.length === 0) {
      return null
   }

   return (
      <Stack sx={styles.carouselWrapper}>
         <EventsPreviewCarousel
            events={recordings}
            location={config.impressionLocation}
            onCardClick={(event) => {
               handleOpenLivestreamDialog(event.id)
            }}
            styling={{ viewportSx: styles.viewport }}
            title={
               <Stack sx={{ gap: 0.5, mb: 1.5 }}>
                  <Typography variant="brandedH5" color="text.primary">
                     {config.title}
                  </Typography>
                  <Typography variant="medium" sx={styles.sectionDescription}>
                     {config.description}
                  </Typography>
               </Stack>
            }
         />
      </Stack>
   )
}
