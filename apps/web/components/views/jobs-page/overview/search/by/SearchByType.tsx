import { jobTypeValueOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDrodown"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByType = () => {
   const { searchJobTypes, setSearchJobTypes } = useJobsOverviewContext()
   const isMobile = useIsMobile()

   return (
      <ChipDropdown
         isDialog={isMobile}
         label="Job type"
         options={jobTypeValueOptions}
         handleValueChange={setSearchJobTypes}
         selectedOptions={searchJobTypes}
         showApply={isMobile}
      />
   )
}
