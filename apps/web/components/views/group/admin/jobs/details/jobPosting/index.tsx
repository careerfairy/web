import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { Paper } from "@mui/material"
import { FC, useCallback } from "react"
import { useJobDialogRouter } from "../../../../../../custom-hook/custom-job/useJobDialogRouter"
import CustomJobAdminDetails from "../../../../../jobs/components/b2b/CustomJobAdminDetails"

type Props = {
   job: CustomJob
   group: Group
}
const JobPosting: FC<Props> = ({ job, group }) => {
   const { openJobDialog } = useJobDialogRouter()

   const handleEdit = useCallback(() => {
      if (job.isPermanentlyExpired) return

      openJobDialog(job.id)
   }, [job.isPermanentlyExpired, job.id, openJobDialog])

   return (
      <Paper>
         <CustomJobAdminDetails
            job={job}
            companyName={group.universityName}
            companyLogoUrl={group.logoUrl}
            handleEdit={handleEdit}
         />
      </Paper>
   )
}

export default JobPosting
