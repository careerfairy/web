import { dropdownValueMapper } from "components/custom-hook/countries/useLocationSearch"

import { useMemo, useRef, useState } from "react"

import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"

import useIsMobile from "components/custom-hook/useIsMobile"

import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   searchField: {
      position: "sticky",
      top: "0px",

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
      limit: 10,
   })

   const locationOptions = useMemo(() => {
      return locations?.map(dropdownValueMapper) ?? []
   }, [locations])

   const inputRef = useRef<HTMLInputElement>(null)

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
                    rootSx: {},
                    paperSx: {
                       // minHeight: "90dvh",
                       //   maxHeight: "50vh",
                       // minHeight: "80vh",
                       height: "100dvh",
                    },
                    contentSx: {
                       minHeight: "350px",
                       // maxHeight: "45vh",
                       // minHeight: "30dvh",
                       // height: "fit-content"
                       // maxHeight: "fit-content !important",
                       // minHeight: "100%",
                       //   minHeight: "30dvh",
                       //   maxHeight: "30dvh",
                       //   maxHeight:  isSearchFocused  && focusCount < 2 ? "30dvh" :"100dvh",
                    },
                 }
               : {},
            search: () => {
               return (
                  <BrandedTextField
                     fullWidth
                     placeholder="Search city, state, canton or country"
                     sx={styles.searchField}
                     value={locationSearchValue}
                     onChange={(e) => setLocationSearchValue(e.target.value)}
                     autoFocus
                     InputProps={{
                        inputRef: inputRef,
                        autoFocus: true,
                     }}
                  />
               )
            },
         }}
         onClose={() => setLocationSearchValue("")}
         onOpen={() => {
            inputRef.current?.focus()
         }}
      />
   )
}
