import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { Paper } from "@mui/material"
import { FC, useCallback } from "react"
import { useDispatch } from "react-redux"
import { openJobsDialog } from "../../../../../../../store/reducers/adminJobsReducer"
import CustomJobAdminDetails from "../../../../../jobs/components/b2b/CustomJobAdminDetails"

type Props = {
   job: CustomJob
   group: Group
}
const JobPosting: FC<Props> = ({ job, group }) => {
   const dispatch = useDispatch()

   const handleClick = useCallback(() => {
      dispatch(openJobsDialog(job.id))
   }, [dispatch, job.id])

   return (
      <Paper>
         <CustomJobAdminDetails
            job={job}
            companyName={group.universityName}
            companyLogoUrl={group.logoUrl}
            handleEdit={job.isPermanentlyExpired ? null : handleClick}
         />
      </Paper>
   )
}

export default JobPosting
