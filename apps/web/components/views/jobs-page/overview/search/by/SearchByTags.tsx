import { ChipDropdown } from "components/views/common/ChipDropdown"

import { BusinessFunctionTagsOptions } from "@careerfairy/shared-lib/constants/tags"

import useIsMobile from "components/custom-hook/useIsMobile"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByTags = () => {
   const { searchBusinessFunctionTags, setSearchBusinessFunctionTags } =
      useJobsOverviewContext()
   const isMobile = useIsMobile()

   return (
      <ChipDropdown
         isDialog={isMobile}
         label="Job fields"
         options={BusinessFunctionTagsOptions}
         handleValueChange={setSearchBusinessFunctionTags}
         selectedOptions={searchBusinessFunctionTags}
         showApply={isMobile}
      />
   )
}
