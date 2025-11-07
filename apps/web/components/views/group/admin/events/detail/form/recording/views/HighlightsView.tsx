import { Typography } from "@mui/material"
import { BaseDetailView } from "./BaseDetailView"

type HighlightsViewProps = {
   onBack: () => void
}

export const HighlightsView = ({ onBack }: HighlightsViewProps) => {
   return (
      <BaseDetailView title="Highlights" onBack={onBack}>
         <Typography variant="medium" color="text.secondary">
            Highlights view content coming soon...
         </Typography>
      </BaseDetailView>
   )
}
