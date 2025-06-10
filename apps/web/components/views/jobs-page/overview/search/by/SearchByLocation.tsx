import { dropdownValueMapper } from "components/custom-hook/countries/useLocationSearch"

import { useMemo, useState } from "react"

import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"

import useIsMobile from "components/custom-hook/useIsMobile"

import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

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
                       minHeight: "70dvh",
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
            search: {
               locationSearchValue,
               setLocationSearchValue,
               placeholder: "Search city, state, canton or country",
            },
         }}
         onClose={() => setLocationSearchValue("")}
         focusSearchInputOnOpenDialog={isMobile}
         onOpen={() => {
            // inputRef.current?.click()
            // inputRef.current?.focus()
            // setTimeout(() => {
            //    inputRef.current?.click()
            // }, 100)
         }}
      />
   )
}
