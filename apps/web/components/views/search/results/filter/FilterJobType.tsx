import { jobTypeValueOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useSearchContext } from "../../SearchContext"

const FilterJobType = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()

   const selectedJobTypes = getFilterValues("jobTypes")

   return (
      <ChipDropdown
         label="Job type"
         options={jobTypeValueOptions}
         selection={{
            selectedOptions: selectedJobTypes,
            onChange: (jobTypes: string[]) =>
               handleFilterSelect("jobTypes", jobTypes),
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

export default FilterJobType
