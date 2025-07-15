import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import useIsMobile from "components/custom-hook/useIsMobile"
import { languageCodesDict } from "components/helperFunctions/streamFormFunctions"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useMemo } from "react"
import { useSearchContext } from "../../SearchContext"

const FilterLanguage = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()

   const selectedLanguages = useMemo(() => {
      return getFilterValues("languages")
   }, [getFilterValues])

   const languageOptions = languageOptionCodes.map((lang) => ({
      id: lang.id,
      value: languageCodesDict[lang.id]?.name || lang.id,
   }))

   return (
      <ChipDropdown
         label="Language"
         options={languageOptions}
         selection={{
            selectedOptions: selectedLanguages,
            onChange: (languages: string[]) =>
               handleFilterSelect("languages", languages),
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

export default FilterLanguage
