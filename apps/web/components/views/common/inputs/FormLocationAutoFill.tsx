import type {
   AddressAutofillFeatureSuggestion,
   AddressAutofillOptions,
   AddressAutofillRetrieveResponse,
} from "@mapbox/search-js-core"
import { AddressAutofillProps } from "@mapbox/search-js-react/dist/components/AddressAutofill"

import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import { useField } from "formik"
import dynamic from "next/dynamic"
import { FC, useCallback, useState } from "react"

const AddressAutofill = dynamic(
   () =>
      import("@mapbox/search-js-react").then(
         (mod) => mod.AddressAutofill as FC<AddressAutofillProps>
      ),
   {
      ssr: false,
   }
)

const DEFAULT_OPTIONS = {
   country: "ch",
   streets: false,
}

export interface LocationAutoFillProps {
   /** Field name for Formik integration */
   name: string
   options?: Partial<AddressAutofillOptions>
   placeholder?: string
   requiredText?: string
   label?: string
   disabled?: boolean
}

export const FormLocationAutoFill: FC<LocationAutoFillProps> = ({
   options = DEFAULT_OPTIONS,
   placeholder = "E.g., Max-Daetwyler-Platz 2",
   label = "Address",
   name,
   disabled,
   requiredText,
}) => {
   const [inputValue, setInputValue] = useState("")

   const [field, meta, helpers] =
      useField<AddressAutofillFeatureSuggestion | null>(name)
   const [selectedSuggestion, setSelectedSuggestion] =
      useState<AddressAutofillFeatureSuggestion | null>(field.value)

   const [isFocused, setIsFocused] = useState(false)

   // Handle address selection from Mapbox suggestions
   const handleSuggestionSelect = (
      suggestion: AddressAutofillFeatureSuggestion
   ) => {
      setSelectedSuggestion(suggestion)
      setInputValue(suggestion.properties.place_name)
      helpers.setValue(suggestion)
      helpers.setTouched(true)
   }

   // Handle retrieve response (backup method)
   const handleRetrieve = (response: AddressAutofillRetrieveResponse) => {
      if (response.features && response.features.length > 0) {
         const selectedFeature = response.features[0]
         handleSuggestionSelect(selectedFeature)
      }
   }

   // Handle input changes from AddressAutofill
   const handleInputChange = useCallback(
      (value: string) => {
         setInputValue(value)

         // Clear selected suggestion if user is typing something different
         if (
            selectedSuggestion &&
            value !== selectedSuggestion.properties.place_name
         ) {
            setSelectedSuggestion(null)
            helpers.setValue(null)
         }
      },
      [selectedSuggestion, helpers]
   )

   // Handle focus events
   const handleFocus = useCallback(() => {
      setIsFocused(true)
   }, [])

   const handleBlur = useCallback(() => {
      setIsFocused(false)
      helpers.setTouched(true)
   }, [helpers])

   // Determine what value to show in the input
   const displayValue = isFocused
      ? inputValue
      : selectedSuggestion?.properties.place_name || inputValue

   return (
      <AddressAutofill
         accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
         onRetrieve={handleRetrieve}
         onChange={handleInputChange}
         options={options}
      >
         <FormBrandedTextField
            // Due to the way Mapbox works, we need to use a fixed name for the input
            // meaning formik cannot get meta errors for this field
            // Workaround: updated BrandedTextField to also use passed error and helperText
            name="address-line1"
            autoComplete="address-line1"
            requiredText={requiredText?.length ? requiredText : null}
            label={label}
            fullWidth
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            error={meta.touched ? Boolean(meta.error) : null}
            helperText={meta.touched ? meta.error : null}
         />
      </AddressAutofill>
   )
}

export default FormLocationAutoFill
