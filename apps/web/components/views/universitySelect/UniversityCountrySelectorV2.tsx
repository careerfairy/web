import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { universityCountriesMap } from "../../util/constants/universityCountries"
import AutocompleteElement from "../common/inputs/ControlledAutoComplete"

type Props = {
   disabled: boolean
   name: string
}

const countryKeys = Object.keys(universityCountriesMap)

const UniversityCountrySelectorV2 = ({ disabled, name }: Props) => {
   return (
      <AutocompleteElement
         autocompleteProps={{
            id: "universityCountryCode",
            fullWidth: true,
            disabled,
            selectOnFocus: true,
            disableClearable: true,
            blurOnSelect: true,
            autoHighlight: true,
            autoComplete: false,
            getOptionLabel: (option) => universityCountriesMap[option] || "",
            isOptionEqualToValue: (option, value) => option === value,
            renderOption: (props, option, { inputValue }) => {
               const data = universityCountriesMap[option]
               const matches = match(data, inputValue)
               const parts = parse(data, matches)

               return (
                  <li {...props}>
                     <div>
                        {parts.map((part, index) => (
                           <span
                              key={index}
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
            },
         }}
         label="Select Country of University"
         data-testid={"university-country-selector"}
         name={name}
         options={countryKeys}
      />
   )
}

export default UniversityCountrySelectorV2
