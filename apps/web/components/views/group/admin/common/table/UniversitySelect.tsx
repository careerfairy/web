import React, { useCallback } from "react"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { Box, ListItemText, Tooltip } from "@mui/material"
import { getMaxLineStyles } from "../../../../../helperFunctions/HelperFunctions"
import { StyledTextField } from "../inputs"
import VirtualizedAutocomplete from "../../../../common/VirtualizedAutocomplete"
import { sxStyles } from "../../../../../../types/commonTypes"
import useUniversitiesByCountryCodes from "../../../../../custom-hook/useUniversities"
import { University } from "@careerfairy/shared-lib/universities"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { useUserDataTable } from "./UserDataTableProvider"

const styles = sxStyles({
   root: {
      flex: 1,
   },
   optionRoot: {
      flex: 1,
      display: "flex",
      width: "100%",
   },
   optionText: {
      ...getMaxLineStyles(1),
      whiteSpace: "pre-line",
   },
   listbox: {
      "& li": {
         backgroundColor: "transparent !important",
         "&:hover": {
            backgroundColor: (theme) =>
               theme.palette.action.hover + " !important",
         },
      },
   },
})
const UniversitySelect = () => {
   const { filters, setFilters } = useUserDataTable()

   // Fetch universities based on selected country codes
   const universities = useUniversitiesByCountryCodes(
      filters.selectedCountryCodes
   )

   const handleChange = useCallback(
      (event: React.SyntheticEvent, value: University) => {
         setFilters((prev) => ({ ...prev, selectedUniversity: value }))
      },
      [setFilters]
   )

   const noCountrySelected = filters.selectedCountryCodes.length === 0

   return (
      <VirtualizedAutocomplete
         freeSolo={false}
         disableClearable={false}
         multiple={false}
         disabled={noCountrySelected}
         options={universities}
         sx={styles.root}
         // @ts-ignore
         renderOption={renderOption}
         listBoxCustomProps={listboxCustomProps}
         isOptionEqualToValue={isOptionEqualToValue}
         value={filters.selectedUniversity || null}
         getOptionLabel={getOptionLabel}
         renderInput={(params) => (
            <StyledTextField
               {...params}
               label={
                  noCountrySelected
                     ? "University (Select country first)"
                     : "University"
               }
               variant="outlined"
               size="small"
            />
         )}
         onChange={handleChange}
      />
   )
}

const listboxCustomProps = {
   listBoxSx: styles.listbox,
}
const isOptionEqualToValue = (option: University, value: University) =>
   option.id === value.id

const getOptionLabel = (option: University) => option.name

const renderOption = (
   props: React.HTMLAttributes<HTMLLIElement>,
   university: University,
   { selected }: AutocompleteRenderOptionState
) => [
   props,
   <Box sx={styles.optionRoot} key={university.id}>
      <Tooltip
         placement={university.name.length > 30 ? "top" : "bottom"}
         title={university.name}
      >
         <ListItemText
            aria-label={university.name}
            primary={university.name}
            primaryTypographyProps={{
               sx: styles.optionText,
            }}
         />
      </Tooltip>
      {selected ? (
         <Box display={"flex"} alignItems={"center"}>
            <CheckRoundedIcon fontSize="small" />
         </Box>
      ) : null}
   </Box>,
]

export default UniversitySelect
