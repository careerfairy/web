import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import CustomJobEntryApply from "../../../../streaming/LeftMenu/categories/jobs/CustomJobEntryApply"

type Props = {
   livestreamId: string
   job: PublicCustomJob
   handleClick: () => void
   isSecondary?: boolean
}
const CustomJobCTAButton = ({ livestreamId, job, handleClick, isSecondary }: Props) => {
   return (
      <CustomJobEntryApply
         job={job as PublicCustomJob}
         livestreamId={livestreamId}
         handleApplyClick={handleClick}
         isSecondary={isSecondary}
      />
   )
}

export default CustomJobCTAButton
