import { FilterOptionsState, createFilterOptions } from "@mui/material"
import { Option } from "components/views/common/inputs/ControlledBrandedAutoComplete"

export const OTHER_OPTION = { id: "other", value: "Other" }
// Always include the "Other" option no matter what the filterOptions function returns

export const filterWithOther = (
   options: Option[],
   state: FilterOptionsState<Option>
) => {
   const results = createFilterOptions<Option>()(options, state)

   if (!results.includes(OTHER_OPTION)) {
      results.unshift(OTHER_OPTION)
   }

   return results
}

// Define error message templates
export const ERROR_MESSAGES = {
   REQUIRED: "Required",
   VALID_URL: "Please enter a valid URL",
   SELECT_FIELD: "Please select a field of study",
   SELECT_LEVEL: "Please select a level of study",
   CHOOSE_COUNTRY: "Please chose a country code",
   SELECT_UNIVERSITY: "Please select a university",
} as const

// Functions to generate common validation rules
export const minLength = (min: number) =>
   [min, `Cannot be shorter than ${min} characters`] as const
export const maxLength = (max: number) =>
   [max, `Cannot be longer than ${max} characters`] as const
