import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"

import { BusinessFunctionTagsOptions } from "@careerfairy/shared-lib/constants/tags"

import useIsMobile from "components/custom-hook/useIsMobile"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByTags = () => {
   const { searchBusinessFunctionTags, setSearchBusinessFunctionTags } =
      useJobsOverviewContext()
   const isMobile = useIsMobile()

   return (
      <ChipDropdown
         label="Job fields"
         options={BusinessFunctionTagsOptions}
         selection={{
            selectedOptions: searchBusinessFunctionTags,
            onChange: setSearchBusinessFunctionTags,
            showApply: isMobile,
         }}
         ui={{
            isDialog: isMobile,
         }}
      />
   )
}
