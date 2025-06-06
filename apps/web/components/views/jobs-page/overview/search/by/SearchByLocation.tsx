import { dropdownValueMapper } from "components/custom-hook/countries/useLocationSearch"

import { useMemo, useState } from "react"

import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"

import useIsMobile from "components/custom-hook/useIsMobile"

import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   searchField: {
      "& .MuiInputBase-root": {
         p: "4px 12px",
         height: "48px",
         borderRadius: "12px",
         border: (theme) => `1px solid ${theme.palette.neutral[50]}`,

         background: (theme) => theme.brand.white[100],
      },
      "& .MuiInputBase-input": {
         ml: "8px",
         p: "0px",
         "&::placeholder": {
            color: (theme) => theme.palette.neutral[600],
            fontSize: "14px",
            fontWeight: "400",
         },
      },
      "& .MuiFilledInput-input": {
         color: (theme) => theme.palette.neutral[800],
         fontSize: "14px",
         fontWeight: "400",
      },
   },
})

export const SearchByLocation = () => {
   const { searchLocations, setSearchLocations } = useJobsOverviewContext()

   const [locationSearchValue, setLocationSearchValue] = useState("")

   const isMobile = useIsMobile()

   const { data: locations } = useLocationSearch(locationSearchValue, {
      suspense: false,
      initialLocationIds: searchLocations ?? [],
   })

   const locationOptions = useMemo(() => {
      return locations?.map(dropdownValueMapper) ?? []
   }, [locations])

   return (
      <ChipDropdown
         label={"Location"}
         options={
            locationSearchValue?.length || searchLocations?.length
               ? locationOptions
               : []
         }
         selection={{
            selectedOptions: searchLocations,
            onChange: setSearchLocations,
            showApply: isMobile,
            onApply: () => {
               setLocationSearchValue("")
            },
         }}
         ui={{
            isDialog: isMobile,
            dialog: {
               rootSx: {
                  // minHeight: isSearchFocused ? "550px" : "90dvh",
                  // maxHeight: isSearchFocused ? "auto" : "90dvh",
               },
               paperSx: {
                  // maxHeight: "55dvh",
                  // minHeight: isSearchFocused ? "auto" : "90dvh",
               },
               contentSx: {
                  minHeight: "100%",
               },
            },
            search: (_, __, searchInputRef) => {
               return (
                  <BrandedTextField
                     fullWidth
                     placeholder="Search city, state, canton or country"
                     sx={styles.searchField}
                     value={locationSearchValue}
                     onChange={(e) => setLocationSearchValue(e.target.value)}
                     inputRef={searchInputRef}
                  />
               )
            },
         }}
         onClose={() => setLocationSearchValue("")}
         focusSearchInputOnOpenDialog={isMobile}
      />
   )
}
