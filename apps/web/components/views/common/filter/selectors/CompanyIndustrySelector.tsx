import MultiCheckboxSelect from "../MultiCheckboxSelect"
import {
   CompanyIndustryValues,
   RelevantCompanyIndustryValues,
} from "../../../../../constants/forms"
import {
   formatToOptionArray,
   multiListSelectMapIdValueFn,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import React, { FC, useCallback } from "react"

import { useRouter } from "next/router"
import { Autocomplete, Box, SxProps, TextField } from "@mui/material"
import { Search } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { StyledCheckbox } from "components/views/group/admin/common/inputs"

const SELECTOR_FILTER_KEY = "companyIndustries"

const styles = sxStyles({
   dropdownCheckbox: {
      transform: "scale(1.2)",
   },
   selectIcon: {
      px: 2,
      pt: 1,
   },
   mousePointer: {
      "&:hover": {
         cursor: "pointer",
      },
   },
   selectedChipsWrapper: { display: "flex", flexWrap: "wrap", gap: 1 },
   mainForm: { width: "100%", mt: 2 },
   optionsDropdownWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
      label: {
         flexGrow: 1,
      },
   },
   chips: {
      color: "primary",
   },
   autoComplete: {
      mt: 1,
      "& .MuiAutocomplete-popupIndicator": {
         transform: "none",
      },
   },
})

type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const CompanyIndustrySelector = ({ handleChange }: Props) => {
   const { query } = useRouter()

   const getSelectedCompanyIndustry = useCallback(() => {
      const queryIndustries = query.companyIndustries as string
      let selectedIndustries = []

      if (queryIndustries) {
         selectedIndustries = formatToOptionArray(
            queryIndustries.split(",").map(decodeURIComponent),
            CompanyIndustryValues
         )
      }
      return selectedIndustries
   }, [query.companyIndustries])

   const onSelectOptionGroup = (selectedOption: OptionGroup[]) => {
      const selectedIndustryOptions = formatToOptionArray(
         selectedOption.map(multiListSelectMapIdValueFn),
         CompanyIndustryValues
      )
      handleChange(SELECTOR_FILTER_KEY, selectedIndustryOptions)
   }

   const selectededCompanies = getSelectedCompanyIndustry()

   const autoCompleteCompaniesOptions = CompanyIndustryValues.map(
      multiListSelectMapIdValueFn
   )

   return (
      <>
         <MultiCheckboxSelect
            inputName={SELECTOR_FILTER_KEY}
            selectedItems={selectededCompanies}
            allValues={RelevantCompanyIndustryValues}
            setFieldValue={handleChange}
            getValueFn={multiListSelectMapValueFn}
            useStyledCheckbox
         />
         <AutoCompleteOption
            options={autoCompleteCompaniesOptions}
            value={selectededCompanies.map((c) => c.id)}
            getOptionLabel={getOptionLabel}
            onSelectOptionsGroup={onSelectOptionGroup}
            sx={styles.autoComplete}
         />
      </>
   )
}

type AutoCompleteOptionProps = {
   options: string[]
   value: string[]
   onSelectOptionsGroup: (selectedOptions: OptionGroup[]) => void
   getOptionLabel: (option: string) => string
   sx?: SxProps
}
const AutoCompleteOption: FC<AutoCompleteOptionProps> = ({
   options,
   value,
   getOptionLabel,
   onSelectOptionsGroup,
   sx,
}) => {
   return (
      <Autocomplete
         sx={sx}
         disabledItemsFocusable
         disableCloseOnSelect
         popupIcon={<Search />}
         multiple
         getOptionLabel={getOptionLabel}
         options={options}
         ChipProps={styles.chips}
         value={value}
         onChange={(_, selectedOptions) => {
            const newOptions = selectedOptions.map((option) => option)
            onSelectOptionsGroup(
               formatToOptionArray(newOptions, CompanyIndustryValues)
            )
         }}
         renderInput={(params) => (
            <Box>
               <TextField {...params} placeholder="Search industry" />
            </Box>
         )}
         renderOption={(props, option, { selected }) => {
            const industryOption = formatToOptionArray(
               [option],
               CompanyIndustryValues
            ).at(0)
            return (
               <li {...props}>
                  <Box sx={styles.optionsDropdownWrapper}>
                     {industryOption.name}
                     <StyledCheckbox
                        checked={selected}
                        sx={styles.dropdownCheckbox}
                        classes={{ root: "custom-checkbox-root" }}
                     />
                  </Box>
               </li>
            )
         }}
      />
   )
}

const getOptionLabel = (optionId): string => {
   const formattedOption = formatToOptionArray(optionId, CompanyIndustryValues)
   if (formattedOption.length) {
      return formattedOption.at(0).name
   }
   return "error: unknow option"
}

export default CompanyIndustrySelector
