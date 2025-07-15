import { CompanyIndustryValues } from "@careerfairy/shared-lib/constants/forms"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useMemo } from "react"
import { useSearchContext } from "../../SearchContext"

const FilterIndustry = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()

   const industryDropdownOptions = CompanyIndustryValues.map((industry) => ({
      id: industry.id,
      value: industry.name,
   }))

   const selectedIndustries = useMemo(() => {
      return getFilterValues("industries")
   }, [getFilterValues])

   return (
      <ChipDropdown
         label="Industry"
         options={industryDropdownOptions}
         selection={{
            selectedOptions: selectedIndustries,
            onChange: (industries: string[]) =>
               handleFilterSelect("industries", industries),
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

export default FilterIndustry
