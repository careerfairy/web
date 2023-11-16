import React, { useCallback } from "react"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { Box, ListItemText, Tooltip } from "@mui/material"
import { getMaxLineStyles } from "../../../../../helperFunctions/HelperFunctions"
import { StyledTextField } from "../inputs"
import VirtualizedAutocomplete from "../../../../common/VirtualizedAutocomplete"
import { sxStyles } from "../../../../../../types/commonTypes"
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
const FieldOfStudySelect = () => {
   const { setFilters, filters, fieldsOfStudyLookup } = useUserDataTable()

   const handleChange = useCallback(
      (event: React.SyntheticEvent, value: string) => {
         const newFieldOfStudy = value
            ? {
                 id: value,
                 name: fieldsOfStudyLookup[value],
              }
            : null

         setFilters((prev) => ({
            ...prev,
            selectedFieldOfStudy: newFieldOfStudy,
         }))
      },
      [fieldsOfStudyLookup, setFilters]
   )

   const getOptionLabel = useCallback(
      (option: string) => fieldsOfStudyLookup[option] || "",
      [fieldsOfStudyLookup]
   )

   const renderOption = useCallback(
      (
         props: React.HTMLAttributes<HTMLLIElement>,
         fieldOfStudy: string,
         { selected }: AutocompleteRenderOptionState
      ) => [
         props,
         <Box sx={styles.optionRoot} key={fieldOfStudy}>
            <Tooltip title={fieldOfStudy}>
               <ListItemText
                  aria-label={fieldsOfStudyLookup[fieldOfStudy]}
                  primary={fieldsOfStudyLookup[fieldOfStudy]}
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
      ],
      [fieldsOfStudyLookup]
   )

   return (
      <VirtualizedAutocomplete
         freeSolo={false}
         disableClearable={false}
         multiple={false}
         options={Object.keys(fieldsOfStudyLookup)}
         sx={styles.root}
         // @ts-ignore
         renderOption={renderOption}
         listBoxCustomProps={listboxCustomProps}
         isOptionEqualToValue={isOptionEqualToValue}
         value={filters.selectedFieldOfStudy?.id || null}
         getOptionLabel={getOptionLabel}
         renderInput={(params) => (
            <StyledTextField
               {...params}
               label="Field Of Study"
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
const isOptionEqualToValue = (option: string, value: string) => option === value

export default FieldOfStudySelect
