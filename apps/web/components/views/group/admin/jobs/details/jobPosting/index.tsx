import { Paper } from "@mui/material"
import CustomJobAdminDetails from "../../../../../jobs/components/b2b/CustomJobAdminDetails"
import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { FC, useCallback } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import { useDispatch } from "react-redux"
import { openJobsDialog } from "../../../../../../../store/reducers/adminJobsReducer"

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
            handleEdit={handleClick}
         />
      </Paper>
   )
}

export default JobPosting
