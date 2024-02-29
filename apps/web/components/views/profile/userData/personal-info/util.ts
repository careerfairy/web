import { FilterOptionsState, createFilterOptions } from "@mui/material"
import { Option } from "components/views/common/inputs/ControlledBrandedAutoComplete"

export const OTHER_UNIVERSITY_OPTION = { id: "other", value: "Other" }

// Always include the "Other" option no matter what the filterOptions function returns
export const filterWithOther = (
   options: Option[],
   state: FilterOptionsState<Option>
) => {
   const results = createFilterOptions<Option>()(options, state)

   if (!results.includes(OTHER_UNIVERSITY_OPTION)) {
      results.unshift(OTHER_UNIVERSITY_OPTION)
   }

   return results
}
