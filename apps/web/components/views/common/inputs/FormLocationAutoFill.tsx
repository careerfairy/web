import type {
   AddressAutofillFeatureSuggestion,
   AddressAutofillOptions,
   AddressAutofillRetrieveResponse,
} from "@mapbox/search-js-core"
import { AddressAutofillProps } from "@mapbox/search-js-react/dist/components/AddressAutofill"
import type { Theme as MapBoxTheme } from "@mapbox/search-js-web"
import { Theme, useTheme } from "@mui/material/styles"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import { useField } from "formik"
import dynamic from "next/dynamic"
import { FC, useCallback, useState } from "react"
import { renderToString } from "react-dom/server"
import { MapPin, Search, X } from "react-feather"

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
   // Using streets as true, would show us street results (not full addresses) and these when selected
   // seem to not fire AddressAutofill.onRetrieve events, so for streets we cannot get any data of the
   // selected street, only the input value is updated.
   streets: false,
}
const iconToSvgString = (IconComponent: any, props: any = {}) => {
   const defaultProps = {
      size: 18, // Icon size is fixed
      ...props,
   }

   return renderToString(<IconComponent {...defaultProps} />)
}

const getDefaultMapBoxTheme = (muiTheme: Theme): MapBoxTheme => {
   return {
      variables: {
         // Base font size and family
         unit: "16px",
         fontFamily: muiTheme.typography.fontFamily,

         // Colors for the selection list
         colorBackground: muiTheme.palette.background.paper, // List background color
         colorText: muiTheme.palette.text.primary, // Main colors, texts and icons
         colorPrimary: "red",
         colorSecondary: muiTheme.palette.text.secondary, // Powered by Mapbox text

         // Hover and active states
         colorBackgroundHover: muiTheme.palette.action.hover,
         colorBackgroundActive: muiTheme.palette.action.selected,

         // Border and spacing
         border: `1px solid ${muiTheme.palette.divider}`,
         borderRadius: "8px",
         boxShadow: muiTheme.shadows[2],
         padding: "12px",
         spacing: "8px",

         // Typography weights
         fontWeight: muiTheme.typography.fontWeightRegular?.toString() || "400",
         fontWeightBold:
            muiTheme.typography.fontWeightBold?.toString() || "700",
         fontWeightSemibold: "600",
         lineHeight: "1.5",

         // Animation
         duration: "150ms",
         curve: "ease-out",
      },
      icons: {
         // Location pin icon for address results - using React Feather MapPin
         addressMarker: iconToSvgString(MapPin),
         // Street icon for street results - using React Feather MapPin
         street: iconToSvgString(MapPin),
         // Search icon - using React Feather Search
         search: iconToSvgString(Search),
         // Close icon - using React Feather X
         close: iconToSvgString(X),
      },
   }
}

export interface LocationAutoFillProps {
   /** Field name for Formik integration */
   name: string
   options?: Partial<AddressAutofillOptions>
   placeholder?: string
   requiredText?: string
   label?: string
   disabled?: boolean
   /** Custom Mapbox theme configuration */
   mapBoxTheme?: MapBoxTheme
}

export const FormLocationAutoFill: FC<LocationAutoFillProps> = ({
   options = DEFAULT_OPTIONS,
   placeholder = "E.g., Max-Daetwyler-Platz 2",
   label = "Address",
   name,
   disabled,
   requiredText,
   mapBoxTheme,
}) => {
   const [inputValue, setInputValue] = useState("")

   const muiTheme = useTheme()
   // Create Mapbox theme based on design system
   const mapboxTheme = mapBoxTheme || getDefaultMapBoxTheme(muiTheme)

   const [field, meta, helpers] =
      useField<AddressAutofillFeatureSuggestion | null>(name)
   const [selectedSuggestion, setSelectedSuggestion] =
      useState<AddressAutofillFeatureSuggestion | null>(field.value)

   const [isFocused, setIsFocused] = useState(false)

   const handleSuggestionSelect = (
      suggestion: AddressAutofillFeatureSuggestion
   ) => {
      setSelectedSuggestion(suggestion)
      setInputValue(suggestion.properties.place_name)
      helpers.setValue(suggestion)
      helpers.setTouched(true)
   }

   const handleRetrieve = (response: AddressAutofillRetrieveResponse) => {
      if (response?.features?.length) {
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

      // We only want to mark the field as touched if the user has interacted with the field and
      // has unfocused the field otherwise the user would get an error as soon as the field is focused
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
         theme={mapboxTheme}
      >
         <FormBrandedTextField
            // Due to the way Mapbox works, we need to use a fixed name for the input
            // meaning formik cannot get meta errors for this field
            // Workaround: updated BrandedTextField to also use passed error and helperText
            name="address-line1"
            autoComplete="address-line1"
            requiredText={requiredText?.length ? requiredText : null}
            label={label}
            placeholder={placeholder}
            fullWidth
            disabled={disabled}
            tooltipPlacement="top"
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
