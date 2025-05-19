import { dropdownValueMapper } from "components/custom-hook/countries/useLocationSearch"

import { useMemo } from "react"

import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"

import useIsMobile from "components/custom-hook/useIsMobile"

import { ChipDropdown } from "components/views/common/ChipDrodown"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"
import { useState } from "react"

export const SearchByLocation = () => {
   const { searchLocations, setSearchLocations } = useJobsOverviewContext()
   const [locationSearchValue, setLocationSearchValue] = useState("Switzerland")
   console.log(
      "🚀 ~ SearchByLocation ~ setLocationSearchValue:",
      setLocationSearchValue
   )
   const isMobile = useIsMobile()
   console.log(
      "🚀 ~ SearchByLocation ~ locationSearchValue:",
      locationSearchValue
   )

   const { data: locations, isLoading } = useLocationSearch(
      locationSearchValue,
      {
         suspense: false,
      }
   )
   console.log("🚀 ~ SearchByLocation ~ isLoading:", isLoading)

   const locationOptions = useMemo(() => {
      return locations?.map(dropdownValueMapper) ?? []
   }, [locations])

   return (
      <ChipDropdown
         isDialog={isMobile}
         label="Location"
         options={locationOptions}
         handleValueChange={setSearchLocations}
         selectedOptions={searchLocations}
      />
   )
}
