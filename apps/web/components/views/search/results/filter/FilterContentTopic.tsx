import { ContentTopicsTagValues } from "@careerfairy/shared-lib/constants/tags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useSearchContext } from "../../SearchContext"

const contentTopicDropdownOptions = ContentTopicsTagValues.map((topic) => ({
   id: topic.id,
   value: topic.name,
}))

const FilterContentTopic = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()

   const selectedContentTopics = getFilterValues("contentTopicIds")

   return (
      <ChipDropdown
         label="Content topic"
         options={contentTopicDropdownOptions}
         selection={{
            selectedOptions: selectedContentTopics,
            onChange: (contentTopics: string[]) =>
               handleFilterSelect("contentTopicIds", contentTopics),
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

export default FilterContentTopic
