import { dropdownValueMapper } from "components/custom-hook/countries/useLocationSearch"

import { useEffect, useMemo, useState } from "react"

import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"

import useIsMobile from "components/custom-hook/useIsMobile"

import { removeDuplicates } from "@careerfairy/shared-lib/utils"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByLocation = () => {
   const { searchLocations, setSearchLocations } = useJobsOverviewContext()
   const [selectedLocations, setSelectedLocations] = useState<string[]>([])
   const [initialLocationIds, setInitialLocationIds] = useState<string[]>(
      () => {
         return removeDuplicates(searchLocations ?? [])
      }
   )

   const [locationSearchValue, setLocationSearchValue] = useState("")
   const isMobile = useIsMobile()

   const { data: locations } = useLocationSearch(locationSearchValue, {
      suspense: false,
      initialLocationIds,
      limit: 15,
   })

   const locationOptions = useMemo(() => {
      return locations?.map(dropdownValueMapper) ?? []
   }, [locations])

   const handleCleanup = () => {
      setLocationSearchValue("")
      setSelectedLocations([])
      setInitialLocationIds([])
   }

   useEffect(() => {
      setInitialLocationIds(
         removeDuplicates(searchLocations?.concat(selectedLocations)) ?? []
      )
   }, [searchLocations, selectedLocations])

   return (
      <ChipDropdown
         label={"Location"}
         options={locationOptions}
         selection={{
            selectedOptions: searchLocations,
            onChange: setSearchLocations,
            showApply: isMobile,
            onApply: handleCleanup,
            onSelectItem: (id) => {
               setSelectedLocations((prev) => [...prev, id])
            },
            onDeleteItem: (id) => {
               setSelectedLocations((prev) =>
                  prev.filter((selectedId) => selectedId !== id)
               )
            },
         }}
         ui={{
            isDialog: isMobile,
            dialog: {
               paperSx: {
                  height: "100dvh",
                  overflow: "hidden",
               },
               contentSx: {
                  minHeight: "50dvh",
                  maxHeight: "55dvh",
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
         onClose={handleCleanup}
         focusSearchInputOnOpenDialog={isMobile}
      />
   )
}
