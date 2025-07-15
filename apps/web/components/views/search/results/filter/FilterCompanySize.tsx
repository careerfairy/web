import { CompanySizesCodes } from "@careerfairy/shared-lib/constants/forms"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useMemo } from "react"
import { useSearchContext } from "../../SearchContext"

const FilterCompanySize = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()

   const companySizeDropdownOptions = CompanySizesCodes.map((size) => ({
      id: size.id,
      value: size.label,
   }))

   const selectedCompanySizes = useMemo(() => {
      return getFilterValues("companySizes")
   }, [getFilterValues])

   return (
      <ChipDropdown
         label="Company Size"
         options={companySizeDropdownOptions}
         selection={{
            selectedOptions: selectedCompanySizes,
            onChange: (companySizes: string[]) =>
               handleFilterSelect("companySizes", companySizes),
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

export default FilterCompanySize
