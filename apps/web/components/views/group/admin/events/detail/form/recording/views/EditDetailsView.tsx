import { Stack } from "@mui/material"
import { RecordingBannerUploader } from "../RecordingBannerUploader"
import {
   RecordingCategoriesFields,
   RecordingFormFields,
} from "../RecordingFormFields"
import { BaseDetailView } from "./BaseDetailView"

type EditDetailsViewProps = {
   onBack: () => void
}

export const EditDetailsView = ({ onBack }: EditDetailsViewProps) => {
   return (
      <BaseDetailView title="Edit" onBack={onBack}>
         <Stack spacing={3}>
            <RecordingFormFields />
            <RecordingBannerUploader />
            <RecordingCategoriesFields />
         </Stack>
      </BaseDetailView>
   )
}
