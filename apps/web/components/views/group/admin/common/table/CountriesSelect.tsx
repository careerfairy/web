import React, { useCallback } from "react"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { Box, Chip, ListItemText } from "@mui/material"
import { getMaxLineStyles } from "../../../../../helperFunctions/HelperFunctions"
import { StyledCheckbox, StyledTextField } from "../inputs"
import VirtualizedAutocomplete from "../../../../common/VirtualizedAutocomplete"
import { sxStyles } from "../../../../../../types/commonTypes"
import { useUserDataTableContext } from "./UserDataTableProvider"

const styles = sxStyles({
   root: {
      minWidth: 300,
      maxWidth: 400,
   },
   optionRoot: {
      flex: 1,
      display: "flex",
   },
   optionText: {
      ...getMaxLineStyles(1),
      whiteSpace: "pre-line",
   },
})
export const CountriesSelect = () => {
   const { countriesLookup, filters, setFilters } = useUserDataTableContext()
   const limit = 10

   const handleChange = useCallback(
      (event: React.SyntheticEvent, value: string[]) => {
         if (!value.length) {
            setFilters((prev) => ({ ...prev, selectedUniversity: null }))
         }
         setFilters((prev) => ({ ...prev, selectedCountryCodes: value }))
      },
      [setFilters]
   )

   const renderOption = (
      props: React.HTMLAttributes<HTMLLIElement>,
      countryCode: string,
      { selected }: AutocompleteRenderOptionState
   ) => [
      props,
      <Box sx={styles.optionRoot} key={countryCode}>
         <ListItemText
            aria-label={countriesLookup[countryCode]}
            primary={countriesLookup[countryCode]}
            primaryTypographyProps={{
               sx: styles.optionText,
            }}
         />
         <Box display={"flex"} alignItems={"center"}>
            <StyledCheckbox checked={selected} />
         </Box>
      </Box>,
   ]

   return (
      <VirtualizedAutocomplete
         multiple={true}
         freeSolo={false}
         disableClearable={false}
         options={Object.keys(countriesLookup)}
         limitTags={1}
         sx={styles.root}
         renderOption={renderOption}
         disableCloseOnSelect
         getOptionDisabled={() => filters.selectedCountryCodes.length >= limit}
         value={filters.selectedCountryCodes}
         getOptionLabel={(option) => countriesLookup[option]}
         renderTags={(value, getTagProps) =>
            value.map((option, index) => (
               <Chip
                  key={option}
                  label={countriesLookup[option]}
                  {...getTagProps({ index })}
                  variant={"outlined"}
               />
            ))
         }
         renderInput={(params) => (
            <StyledTextField
               {...params}
               label="Countries"
               variant="outlined"
               size="small"
            />
         )}
         onChange={handleChange}
      />
   )
}
