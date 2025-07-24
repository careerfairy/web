import { BusinessFunctionTagsOptions } from "@careerfairy/shared-lib/constants/tags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useSearchContext } from "../../SearchContext"

const FilterBusinessFunctionTags = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()

   const selectedBusinessFunctionTags = getFilterValues("businessFunctionTags")

   return (
      <ChipDropdown
         label="Job fields"
         options={BusinessFunctionTagsOptions}
         selection={{
            selectedOptions: selectedBusinessFunctionTags,
            onChange: (businessFunctionTags: string[]) =>
               handleFilterSelect("businessFunctionTags", businessFunctionTags),
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

export default FilterBusinessFunctionTags
