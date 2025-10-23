import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import type { AddressAutofillOptions } from "@mapbox/search-js-core"
import { useAddressAutofillCore } from "@mapbox/search-js-react"
import { AutocompleteInputChangeReason, Box, Typography } from "@mui/material"
import { GeoPoint } from "firebase/firestore"
import { useField } from "formik"
import { geohashForLocation } from "geofire-common"
import { FC, useCallback, useEffect, useState } from "react"
import { MapPin } from "react-feather"
import { sxStyles } from "types/commonTypes"
import BrandedAutocomplete from "./BrandedAutocomplete"

const DEFAULT_OPTIONS: Partial<AddressAutofillOptions> = {
   country: "ch",
}

// Styles for professional option rendering
const styles = sxStyles({
   optionContainer: {
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      py: 1.25,
      px: 1.5,
      mx: 0.75,
      mb: 0.25,
      borderRadius: "6px",
      transition: "background-color 0.15s ease-in-out",
      "&:last-child": {
         mb: 0,
      },
   },
   iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mt: 0.125,
      width: 20,
      height: 20,
      borderRadius: "50%",
      backgroundColor: (theme) => theme.brand.white[300],
      "& svg": {
         width: 14,
         height: 14,
         color: "secondary.main",
      },
   },
   textContainer: {
      flex: 1,
      minWidth: 0, // Allows text to truncate
      display: "flex",
      flexDirection: "column",
      gap: 0.25,
   },
   primaryText: {
      fontWeight: 600,
      lineHeight: 1.2,
      color: "text.primary",
      fontSize: "0.9rem",
   },
   secondaryText: {
      lineHeight: 1.1,
      color: "text.secondary",
      fontSize: "0.8rem",
      opacity: 0.8,
   },
})

/**
 * Parses address components from Mapbox place_name for better display
 */
const parseAddressComponents = (placeName: string) => {
   const parts = placeName.split(", ")
   if (parts.length < 2) {
      return { primary: placeName, secondary: "" }
   }

   // For Swiss addresses, typically: "Street Number, Postal Code City, Country"
   // Or: "Place Name, Postal Code City, Country"
   const streetName = parts[0] // Street address or place name
   const locationParts = parts.slice(1) // [postal code + city, country]

   // Extract postal code and city from the second part
   let primary = streetName
   let secondary = ""

   if (locationParts.length > 0) {
      const postalAndCity = locationParts[0]
      const country = locationParts[1] || ""

      // Try to split postal code and city (e.g., "2072 Saint-Blaise")
      const postalCityMatch = postalAndCity.match(/^(\d{4})\s+(.+)$/)
      if (postalCityMatch) {
         const [, postalCode, cityName] = postalCityMatch
         primary = streetName
         secondary = `${cityName} ${postalCode}${country ? `, ${country}` : ""}`
      } else {
         secondary = locationParts.join(", ")
      }
   }

   return { primary, secondary }
}

/**
 * Professional option element renderer for address suggestions
 * Note: BrandedAutocomplete uses getOptionElement instead of renderOption
 */
const getAddressOptionElement = (option: Option) => (
   <Box sx={styles.optionContainer}>
      <Box sx={styles.iconContainer}>
         <MapPin />
      </Box>
      <Box sx={styles.textContainer}>
         {(() => {
            const { primary, secondary } = parseAddressComponents(option.name)
            return (
               <>
                  <Typography
                     variant="medium"
                     sx={styles.primaryText}
                     component="div"
                  >
                     {primary}
                  </Typography>
                  {Boolean(secondary) && (
                     <Typography
                        variant="small"
                        sx={styles.secondaryText}
                        component="div"
                     >
                        {secondary}
                     </Typography>
                  )}
               </>
            )
         })()}
      </Box>
   </Box>
)

// Option type for StyledLazyBrandedAutocomplete - must have id and name
type Option = {
   id: string
   name: string
   suggestion?: any // Mapbox suggestion object for retrieval
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
   const [field, , helpers] = useField<OfflineEvent["address"] | null>(name)

   const [suggestions, setSuggestions] = useState<Option[]>([])
   const [loading, setLoading] = useState(false)

   const [inputValue, setInputValue] = useState("")
   const [isSearching, setIsSearching] = useState(false)

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [sessionToken, setSessionToken] = useState(
      () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
   )

   // Initialize Mapbox autofill core
   const autofill = useAddressAutofillCore({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
      ...options,
   } as any)

   // Sync inputValue with field value when field changes externally
   useEffect(() => {
      if (!isSearching) {
         const displayValue = field.value?.placeName || ""
         if (inputValue !== displayValue) {
            setInputValue(displayValue)
         }
      }
   }, [field.value, isSearching, inputValue])

   // Handle input changes and fetch suggestions
   const handleInputChange = useCallback(
      async (value: string, reason: AutocompleteInputChangeReason) => {
         // Handle clear button specifically
         if (reason === "clear") {
            setInputValue("")
            setSuggestions([])
            setIsSearching(false)
            helpers.setValue(null)
            return
         }

         if (reason === "reset") {
            return
         }

         setInputValue(value)
         setIsSearching(true)

         if (!value.trim()) {
            setSuggestions([])
            setIsSearching(false)
            return
         }

         setLoading(true)
         try {
            const response = await autofill.suggest(value, {
               sessionToken,
            })

            const mappedSuggestions: Option[] = response.suggestions.map(
               (suggestion) => ({
                  id: suggestion.mapbox_id,
                  name: suggestion.place_name,
                  // Store the full suggestion data for later retrieval
                  suggestion,
               })
            )

            setSuggestions(mappedSuggestions)
         } catch (error) {
            console.error("Error fetching suggestions:", error)
            setSuggestions([])
         } finally {
            setLoading(false)
         }
      },
      [autofill, helpers, sessionToken]
   )

   // Handle selection of a suggestion
   const handleSuggestionSelect = useCallback(
      async (selectedOption: Option | null) => {
         setIsSearching(false)

         if (!selectedOption?.suggestion) {
            helpers.setValue(null)
            setInputValue("")
            setSuggestions([])
            return
         }

         try {
            const response = await autofill.retrieve(
               selectedOption.suggestion as any,
               {
                  sessionToken,
               }
            )

            if (response?.features?.length) {
               const selectedFeature = response.features[0]
               const locationData =
                  extractLocationFromSuggestion(selectedFeature)
               helpers.setValue(locationData)
               helpers.setTouched(true)
               // inputValue will be updated by the useEffect
               setSuggestions([])
            }
         } catch (error) {
            console.error("Error retrieving address details:", error)
         }
      },
      [autofill, helpers, sessionToken]
   )

   // Convert field value to display option (only when not searching)
   const selectedOption: Option | null =
      !isSearching && field.value
         ? {
              id: field.value.placeName || "",
              name: field.value.placeName || "",
           }
         : null

   return (
      <BrandedAutocomplete
         options={suggestions}
         loading={loading}
         freeSolo={true}
         filterOptions={(options) => options} // Don't filter, use Mapbox results
         getOptionLabel={(option) => {
            if (typeof option === "string") return option
            return option.name || ""
         }}
         onInputChange={(_, value, reason) => {
            handleInputChange(value, reason)
         }}
         getOptionElement={getAddressOptionElement}
         onChange={(_, value) => {
            handleSuggestionSelect(value as Option | null)
         }}
         inputValue={inputValue}
         value={selectedOption}
         noOptionsText={
            inputValue.trim()
               ? "No addresses found"
               : "Start typing to search addresses"
         }
         textFieldProps={{
            name: "address-line1",
            label,
            placeholder,
            requiredText: requiredText || "",
            disabled,
            autocomplete: true,
            autoComplete: "address-line1",
         }}
      />
   )
}
/**
 * Extracts location and geohash from Mapbox street suggestion
 * @param suggestion - The Mapbox AddressAutofillFeatureSuggestion
 * @returns Object with location (GeoPoint) and geoHash, or undefined if invalid
 */
function extractLocationFromSuggestion(
   suggestion: any
): OfflineEvent["address"] {
   // Properties may include context and text fields for address components
   const { properties } = suggestion

   const location: OfflineEvent["address"] = {
      fullAddress: suggestion.properties.full_address || null,
      country: properties.country || null,
      countryCode: properties.country_code || null,
      // @ts-ignore
      state: properties.region || null,
      // @ts-ignore
      stateCode: properties.region_code || null,
      // @ts-ignore
      city: properties.place || null,
      postcode: suggestion.properties.postcode || null,
      // @ts-ignore
      street: suggestion.properties.street || null,
      // @ts-ignore
      streetNumber: suggestion.properties.address_number || null,
      placeName: suggestion.properties.place_name || null,
      address_level1: suggestion.properties.address_level1 || null,
      address_level2: suggestion.properties.address_level2 || null,
      ...(suggestion.geometry.coordinates.length
         ? {
              geoPoint: new GeoPoint(
                 suggestion.geometry.coordinates[1],
                 suggestion.geometry.coordinates[0]
              ),
              geoHash: geohashForLocation([
                 suggestion.geometry.coordinates[1],
                 suggestion.geometry.coordinates[0],
              ]),
           }
         : {
              geoPoint: null,
              geoHash: null,
           }),
   }

   return location
}

export default FormLocationAutoFill
