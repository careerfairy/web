import { jobTypeValueOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByType = () => {
   const { searchJobTypes, setSearchJobTypes } = useJobsOverviewContext()
   const isMobile = useIsMobile()

   return (
      <ChipDropdown
         label="Job type"
         options={jobTypeValueOptions}
         selection={{
            selectedOptions: searchJobTypes,
            onChange: setSearchJobTypes,
            showApply: isMobile,
         }}
         ui={{
            isDialog: isMobile,
            popperSx: {
               zIndex: 2,
            },
         }}
      />
   )
}
