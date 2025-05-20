import { ChipDropdown } from "components/views/common/ChipDrodown"

import { BusinessFunctionsTagValues } from "@careerfairy/shared-lib/constants/tags"

import useIsMobile from "components/custom-hook/useIsMobile"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByTags = () => {
   const { searchBusinessFunctionTags, setSearchBusinessFunctionTags } =
      useJobsOverviewContext()
   const isMobile = useIsMobile()
   const businessFunctionTagsOptions = BusinessFunctionsTagValues.map(
      (tag) => ({
         id: tag.id,
         value: tag.name,
      })
   )

   return (
      <ChipDropdown
         isDialog={isMobile}
         label="Job fields"
         options={businessFunctionTagsOptions}
         handleValueChange={setSearchBusinessFunctionTags}
         selectedOptions={searchBusinessFunctionTags}
         showApply={isMobile}
      />
   )
}
