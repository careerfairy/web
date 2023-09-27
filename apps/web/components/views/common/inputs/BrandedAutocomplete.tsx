import { Autocomplete, AutocompleteProps } from "@mui/material"
import { styled } from "@mui/material/styles"
import BrandedChip from "./BrandedChip"
import BrandedTextField from "./BrandedTextField"

interface OptionType {
   name: string
   id: string
}

type BrandedAutocompleteProps<T extends OptionType = OptionType> = Omit<
   AutocompleteProps<T, boolean, boolean, boolean>,
   "renderInput" | "renderTags"
> & {
   inputLabel: string
}

const BrandedAutocomplete = styled(
   ({ inputLabel, getOptionLabel, ...props }: BrandedAutocompleteProps) => (
      <Autocomplete
         {...props}
         renderInput={(params) => (
            <BrandedTextField {...params} label={inputLabel} />
         )}
         renderTags={(values, getTagProps) =>
            values.map((option, index) => (
               <BrandedChip
                  key={index}
                  label={
                     Array.isArray(option)
                        ? option.map(getOptionLabel).join(", ")
                        : typeof option === "string"
                        ? option
                        : option.name
                  }
                  {...getTagProps({ index })}
               />
            ))
         }
      />
   )
)({})

export default BrandedAutocomplete
