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
      limit: 15,
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
               paperSx: {
                  height: "100dvh",
               },
               contentSx: {
                  minHeight: "70dvh",
               },
            },
            search: {
               locationSearchValue,
               setLocationSearchValue,
               placeholder: "Search city, state, canton or country",
            },
            popperSx: {
               zIndex: 2,
            },
         }}
         onClose={() => setLocationSearchValue("")}
         focusSearchInputOnOpenDialog={isMobile}
      />
   )
}
