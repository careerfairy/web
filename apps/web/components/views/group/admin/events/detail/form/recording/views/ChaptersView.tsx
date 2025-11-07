import { Typography } from "@mui/material"
import { BaseDetailView } from "./BaseDetailView"

type ChaptersViewProps = {
   onBack: () => void
}

export const ChaptersView = ({ onBack }: ChaptersViewProps) => {
   return (
      <BaseDetailView title="Chapters" onBack={onBack}>
         <Typography variant="medium" color="text.secondary">
            Chapters view content coming soon...
         </Typography>
      </BaseDetailView>
   )
}
