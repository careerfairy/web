import { Autocomplete, AutocompleteProps, InputAdornment } from "@mui/material"
import { styled } from "@mui/material/styles"
import BrandedTextField, { BrandedTextFieldProps } from "./BrandedTextField"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { Search } from "react-feather"

type Option = {
   id: string
}
type BrandedSearchProps<T extends Option> = Omit<
   AutocompleteProps<T, boolean, boolean, boolean>,
   "renderInput" | "renderTags"
> & {
   textFieldProps?: BrandedTextFieldProps
}

const BrandedSearch = styled(
   <T extends Option>({
      textFieldProps,
      getOptionLabel,
      ...props
   }: BrandedSearchProps<T>) => (
      <Autocomplete
         {...props}
         renderOption={(props, option: T, { inputValue }) => {
            const label = getOptionLabel(option)
            const matches = match(label, inputValue)
            const parts = parse(label, matches)
            const key = `listItem-${option.id}-${option.id}`
            return (
               <li {...props} key={key}>
                  <div>
                     {parts.map((part, index) => (
                        <span
                           key={index + part.text}
                           style={{
                              fontWeight: part.highlight ? 700 : 400,
                           }}
                        >
                           {part.text}
                        </span>
                     ))}
                  </div>
               </li>
            )
         }}
         color="primary"
         getOptionLabel={getOptionLabel}
         renderInput={(params) => (
            <BrandedTextField
               {...params}
               {...textFieldProps}
               InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                     <InputAdornment position="start">
                        <Search color={"black"} />
                     </InputAdornment>
                  ),
               }}
            />
         )}
      />
   )
)({})

export default BrandedSearch
