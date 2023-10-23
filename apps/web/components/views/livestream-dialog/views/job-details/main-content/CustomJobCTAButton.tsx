import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import CustomJobEntryApply from "../../../../streaming/LeftMenu/categories/jobs/CustomJobEntryApply"

type Props = {
   livestreamId: string
   job: PublicCustomJob
   handleClick: () => void
}
const CustomJobCTAButton = ({ livestreamId, job, handleClick }: Props) => {
   return (
      <CustomJobEntryApply
         job={job as PublicCustomJob}
         livestreamId={livestreamId}
         handleApplyClick={handleClick}
      />
   )
}

export default CustomJobCTAButton
