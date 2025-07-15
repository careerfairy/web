import { useFieldsOfStudy } from "components/custom-hook/useCollection"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useMemo } from "react"
import { useSearchContext } from "../../SearchContext"

const FilterFieldOfStudy = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()
   const { data: fieldsOfStudy, isLoading } = useFieldsOfStudy()

   const fieldOfStudyDropdownOptions = useMemo(() => {
      if (isLoading) {
         return []
      }
      return fieldsOfStudy.map((field) => ({
         id: field.id,
         value: field.name,
      }))
   }, [fieldsOfStudy, isLoading])

   const selectedFieldsOfStudy = useMemo(() => {
      return getFilterValues("fieldsOfStudy")
   }, [getFilterValues])

   return (
      <ChipDropdown
         label="Field of Study"
         options={fieldOfStudyDropdownOptions}
         selection={{
            selectedOptions: selectedFieldsOfStudy,
            onChange: (fieldsOfStudy: string[]) =>
               handleFilterSelect("fieldsOfStudy", fieldsOfStudy),
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

export default FilterFieldOfStudy
