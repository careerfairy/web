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
   const [isSearchFocused, setIsSearchFocused] = useState(false)
   const [focusCount, setFocusCount] = useState(0)
   const isMobile = useIsMobile()

   // const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(searchLocations ?? [])
   // const initialLocationIds = useMemo(() => {
   //    return (searchLocations ?? []).concat(selectedLocationIds)
   // }, [searchLocations])

   const { data: locations } = useLocationSearch(locationSearchValue, {
      suspense: false,
      initialLocationIds: searchLocations ?? [],
      limit: 5,
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
            dialog: isMobile
               ? {
                    rootSx: {
                       minHeight: isSearchFocused ? "90dvh" : "90dvh",
                       maxHeight: isSearchFocused ? "90dvh" : "90dvh",
                    },
                    paperSx: {
                       maxHeight: focusCount > 1 ? "55dvh" : "auto",
                       // minHeight: isSearchFocused ? "90dvh" : "90dvh",
                    },
                    contentSx: {
                       // minHeight: "100%",
                    },
                 }
               : {},
            search: (_, __, searchInputRef) => {
               return (
                  <BrandedTextField
                     fullWidth
                     placeholder="Search city, state, canton or country"
                     sx={styles.searchField}
                     value={locationSearchValue}
                     onChange={(e) => setLocationSearchValue(e.target.value)}
                     inputRef={searchInputRef}
                     onFocus={() => {
                        setIsSearchFocused(true)
                        setFocusCount((prev) => prev + 1)
                     }}
                     onBlur={() => setIsSearchFocused(false)}
                  />
               )
            },
         }}
         onClose={() => setLocationSearchValue("")}
         focusSearchInputOnOpenDialog={isMobile}
      />
   )
}
