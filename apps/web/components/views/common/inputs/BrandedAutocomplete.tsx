import { Autocomplete, AutocompleteProps, Chip } from "@mui/material"
import { FC } from "react"
import BrandedTextField from "./BrandedTextField"
import { sxStyles } from "types/commonTypes"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"

const styles = sxStyles({
   chip: {
      display: "flex",
      padding: "4px 4px 4px 12px",
      alignItems: "flex-start",
      gap: "10px",
      borderRadius: "60px",
      background: "#6749EA",
      color: "#FFF",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "20px",
      ".MuiChip-deleteIcon": {
         color: "#FFF",
      },
   },
})

type Props = {
   name?: string
   label: string
   handleBlur?: () => {}
   isSubmitting?: boolean
   options: OptionGroup[]
}

export type BrandedAutocompleteProps = Omit<
   AutocompleteProps<OptionGroup, true, false, false>,
   "renderInput" | "renderTags"
> &
   Props

export const BrandedAutocomplete: FC<BrandedAutocompleteProps> = ({
   label,
   handleBlur,
   isSubmitting = false,
   options,
   ...props
}) => {
   return (
      <Autocomplete
         options={options}
         renderTags={(values: OptionGroup[], getTagProps) => {
            return values.map((value, index) => (
               <Chip
                  sx={styles.chip}
                  label={value.name}
                  {...getTagProps({ index })}
               />
            ))
         }}
         renderInput={(params) => (
            <BrandedTextField
               {...params}
               label={label}
               onBlur={handleBlur}
               disabled={isSubmitting}
            />
         )}
         {...props}
      />
   )
}

export default BrandedAutocomplete
