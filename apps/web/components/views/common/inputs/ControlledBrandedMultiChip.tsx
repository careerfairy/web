import { Box, ListItemText, MenuItem } from "@mui/material"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import { FieldPath, FieldValues } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { BrandedCheckbox } from "./BrandedCheckbox"
import {
   AutocompleteElementProps,
   ControlledBrandedAutoComplete,
   Option,
} from "./ControlledBrandedAutoComplete"

const styles = sxStyles({
   autocompleteWrapper: {
      ...BaseStyles.chipInput,
      "& .MuiAutocomplete-root": {
         "& .MuiFilledInput-root": {
            backgroundColor: (theme) => theme.brand.white[300],
            border: (theme) => `1px solid ${theme.palette.secondary[100]}`,
            borderRadius: "8px",
            paddingTop: 3,
            paddingBottom: 1,
            paddingLeft: "14px",
            paddingRight: "14px",
            "&:hover": {
               backgroundColor: (theme) => theme.brand.white[300],
               border: (theme) => `1px solid ${theme.palette.secondary[100]}`,
            },
            "&.Mui-focused": {
               backgroundColor: (theme) => theme.brand.white[300],
               border: (theme) => `1px solid ${theme.palette.secondary[100]}`,
            },
            "&::before": {
               display: "none",
            },
            "&::after": {
               display: "none",
            },
         },
         "& .MuiInputBase-input": {
            padding: 0,
         },
      },
   },
})

// Reuse the same renderOption logic from FormBrandedAutocomplete
const renderOption = (optionProps: any, option: Option, { selected }: any) => (
   <MenuItem
      {...optionProps}
      key={option.id}
      sx={{
         '&[aria-selected="true"]': {
            backgroundColor: (theme) => `${theme.brand.black[100]} !important`,
         },
      }}
   >
      <ListItemText primary={option.value} sx={{ padding: "16px" }} />
      <BrandedCheckbox checked={selected} />
   </MenuItem>
)

export type ControlledBrandedMultiChipProps<
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<
   AutocompleteElementProps<Option, TFieldValues, TName>,
   "multiple" | "autocompleteProps" | "textFieldProps"
> & {
   required?: boolean
   autocompleteProps?: Omit<
      AutocompleteElementProps<
         Option,
         TFieldValues,
         TName
      >["autocompleteProps"],
      "renderOption" | "getOptionLabel" | "disableCloseOnSelect"
   >
   textFieldProps?: Omit<
      AutocompleteElementProps<Option, TFieldValues, TName>["textFieldProps"],
      "requiredText"
   >
}

export const ControlledBrandedMultiChip = <
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
   required,
   autocompleteProps,
   textFieldProps,
   ...props
}: ControlledBrandedMultiChipProps<TFieldValues, TName>) => {
   return (
      <Box sx={styles.autocompleteWrapper}>
         <ControlledBrandedAutoComplete
            {...props}
            multiple
            autocompleteProps={{
               disableCloseOnSelect: true,
               renderOption,
               getOptionLabel: (option) =>
                  typeof option === "string" ? option : option.value || "",
               ...autocompleteProps,
            }}
            textFieldProps={{
               requiredText: required ? "(required)" : "",
               ...textFieldProps,
            }}
         />
      </Box>
   )
}
