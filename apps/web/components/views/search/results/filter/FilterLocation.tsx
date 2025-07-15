import { removeDuplicates } from "@careerfairy/shared-lib/utils"
import {
   dropdownValueMapper,
   useLocationSearch,
} from "components/custom-hook/countries/useLocationSearch"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdown } from "components/views/common/ChipDropdown/ChipDropdown"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchContext } from "../../SearchContext"

const FilterLocation = () => {
   const { handleFilterSelect, getFilterValues } = useSearchContext()
   const isMobile = useIsMobile()
   const [selectedLocations, setSelectedLocations] = useState<string[]>([])
   const [locationSearchValue, setLocationSearchValue] = useState("")

   const selectedLocationsFromQuery = useMemo(() => {
      return getFilterValues("locations")
   }, [getFilterValues])

   const [initialLocationIds, setInitialLocationIds] = useState<string[]>(
      () => {
         return removeDuplicates(selectedLocationsFromQuery ?? [])
      }
   )

   const { data: locations } = useLocationSearch(locationSearchValue, {
      suspense: false,
      initialLocationIds,
      limit: 15,
   })

   const locationOptions = useMemo(() => {
      return locations?.map(dropdownValueMapper) ?? []
   }, [locations])

   const handleCleanup = useCallback(() => {
      setLocationSearchValue("")
      setSelectedLocations([])
      setInitialLocationIds([])
   }, [])

   useEffect(() => {
      setInitialLocationIds(
         removeDuplicates(
            selectedLocationsFromQuery?.concat(selectedLocations)
         ) ?? []
      )
   }, [selectedLocationsFromQuery, selectedLocations])

   return (
      <ChipDropdown
         label="Location"
         options={locationOptions}
         selection={{
            selectedOptions: selectedLocationsFromQuery,
            onChange: (locations: string[]) =>
               handleFilterSelect("locations", locations),
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
                  minHeight: "60dvh",
                  maxHeight: "70dvh",
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

export default FilterLocation
