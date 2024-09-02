import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import CustomJobDetailsView from "../custom-jobs/CustomJobDetailsView"

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
   // if(!job.id)
   //    return null
   return (
      <Box sx={styles.wrapper}>
         {/* <SuspenseWithBoundary> */}
         <CustomJobDetailsView
            job={job}
            companyName={companyName}
            companyLogoUrl={companyLogoUrl}
            handleEdit={handleEdit}
            disabledLinkedContentClick
            // disableSuspense
         />
         {/* </SuspenseWithBoundary> */}
      </Box>
   )
}

export default CustomJobAdminDetails
