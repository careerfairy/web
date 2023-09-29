import { Box } from "@mui/material"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"

type Props = {
   job: PublicCustomJob
   handleRemove: () => void
   handleEdit: () => void
}
const CustomJobPreview = ({}: Props) => {
   return <Box>Custom Job preview</Box>
}

export default CustomJobPreview
