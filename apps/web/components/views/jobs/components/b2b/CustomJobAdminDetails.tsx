import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import CustomJobDetailsView from "../CustomJobDetailsView"

const styles = sxStyles({
   wrapper: {
      p: 2,
   },
})

type Props = {
   job: CustomJob
   handleEdit?: () => void
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
}: Props) => {
   return (
      <Box sx={styles.wrapper}>
         <CustomJobDetailsView
            job={job}
            companyName={companyName}
            companyLogoUrl={companyLogoUrl}
            handleEdit={handleEdit}
            disabledLinkedContentClick
         />
      </Box>
   )
}

export default CustomJobAdminDetails
